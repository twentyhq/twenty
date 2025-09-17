import { Logger } from '@nestjs/common';

import {
  CreateEmailIdentityCommand,
  CreateTenantCommand,
  CreateTenantResourceAssociationCommand,
  GetEmailIdentityCommand,
  PutEmailIdentityDkimAttributesCommand,
} from '@aws-sdk/client-sesv2';

import { type AwsSesDriverConfig } from 'src/engine/core-modules/outbound-message-domain/drivers/interfaces/driver-config.interface';
import { type OutboundMessageDomainDriverInterface } from 'src/engine/core-modules/outbound-message-domain/drivers/interfaces/outbound-message-domain-driver.interface';

import { type AwsSesClientProvider } from 'src/engine/core-modules/outbound-message-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { type AwsSesHandleErrorService } from 'src/engine/core-modules/outbound-message-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { OutboundMessageDomainStatus } from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';
import { type VerificationRecord } from 'src/engine/core-modules/outbound-message-domain/drivers/types/verifications-record';
import { type OutboundMessageDomain } from 'src/engine/core-modules/outbound-message-domain/outbound-message-domain.entity';

export class AwsSesDriver implements OutboundMessageDomainDriverInterface {
  private readonly logger = new Logger(AwsSesDriver.name);

  constructor(
    private readonly config: AwsSesDriverConfig,
    private readonly awsSesClientProvider: AwsSesClientProvider,
    private readonly awsSesHandleErrorService: AwsSesHandleErrorService,
  ) {}

  async verifyDomain(
    domain: OutboundMessageDomain,
  ): Promise<OutboundMessageDomain> {
    try {
      this.logger.log(`Starting domain verification for: ${domain.domain}`);

      const tenantName = this.generateTenantName(domain.workspaceId);

      await this.ensureTenantExists(tenantName);

      const { isVerified, verificationRecords } =
        await this.createOrUpdateEmailIdentity(domain.domain, tenantName);

      if (isVerified) {
        await this.enableDkimSigning(domain.domain);
      }

      return {
        ...domain,
        status: isVerified
          ? OutboundMessageDomainStatus.VERIFIED
          : OutboundMessageDomainStatus.PENDING,
        verifiedAt: isVerified ? new Date() : null,
        verificationRecords,
      };
    } catch (error) {
      this.logger.error(`Failed to verify domain ${domain.domain}: ${error}`);
      this.awsSesHandleErrorService.handleAwsSesError(error, 'verifyDomain');
      throw error;
    }
  }

  async getDomainStatus(
    domain: OutboundMessageDomain,
  ): Promise<OutboundMessageDomain> {
    try {
      this.logger.log(`Getting domain status for: ${domain.domain}`);

      const sesClient = this.awsSesClientProvider.getSESClient();

      const getIdentityCommand = new GetEmailIdentityCommand({
        EmailIdentity: domain.domain,
      });

      const identityResponse = await sesClient.send(getIdentityCommand);

      const status = this.determineVerificationStatus(identityResponse);
      const isFullyVerified = status === OutboundMessageDomainStatus.VERIFIED;

      return {
        ...domain,
        status,
        verifiedAt: isFullyVerified ? domain.verifiedAt || new Date() : null,
        verificationRecords: domain.verificationRecords,
      };
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return {
          ...domain,
          status: OutboundMessageDomainStatus.FAILED,
          verifiedAt: null,
          verificationRecords: [],
        };
      }

      this.logger.error(
        `Failed to get domain status ${domain.domain}: ${error}`,
      );
      this.awsSesHandleErrorService.handleAwsSesError(error, 'getDomainStatus');
    }
  }

  async getDomainVerificationRecords(domainName: string): Promise<string> {
    try {
      this.logger.log(`Getting verification records for domain: ${domainName}`);

      const sesClient = this.awsSesClientProvider.getSESClient();

      const getIdentityCommand = new GetEmailIdentityCommand({
        EmailIdentity: domainName,
      });

      const response = await sesClient.send(getIdentityCommand);
      const dkimTokens = response.DkimAttributes?.Tokens;

      if (!dkimTokens || dkimTokens.length === 0) {
        throw new Error('No DKIM tokens found for domain');
      }

      return dkimTokens[0];
    } catch (error) {
      this.logger.error(
        `Failed to get verification records for ${domainName}: ${error}`,
      );
      this.awsSesHandleErrorService.handleAwsSesError(
        error,
        'getDomainVerificationRecords',
      );
    }
  }

  private generateTenantName(workspaceId: string): string {
    return `twenty-workspace-${workspaceId}`;
  }

  private async ensureTenantExists(tenantName: string): Promise<void> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    try {
      await sesClient.send(new CreateTenantCommand({ TenantName: tenantName }));
      this.logger.log(`Created tenant: ${tenantName}`);
    } catch (error) {
      if (error.name === 'AlreadyExistsException') {
        this.logger.log(`Tenant already exists: ${tenantName}`);

        return;
      }
      throw error;
    }
  }

  private async createOrUpdateEmailIdentity(
    domain: string,
    tenantName: string,
  ): Promise<{
    isVerified: boolean;
    verificationRecords: VerificationRecord[];
  }> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    try {
      const getIdentityCommand = new GetEmailIdentityCommand({
        EmailIdentity: domain,
      });
      const existingIdentity = await sesClient.send(getIdentityCommand);

      const isVerified = existingIdentity.VerifiedForSendingStatus === true;
      const verificationRecords = this.buildVerificationRecords(
        domain,
        existingIdentity.DkimAttributes?.Tokens || [],
      );

      if (!isVerified) {
        await this.associateResourceWithTenant(domain, tenantName);
      }

      return { isVerified, verificationRecords };
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return await this.createNewEmailIdentity(domain, tenantName);
      }
      throw error;
    }
  }

  private async createNewEmailIdentity(
    domain: string,
    tenantName: string,
  ): Promise<{
    isVerified: boolean;
    verificationRecords: VerificationRecord[];
  }> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    const createCommand = new CreateEmailIdentityCommand({
      EmailIdentity: domain,
      Tags: [{ Key: 'Tenant', Value: tenantName }],
    });

    const createResponse = await sesClient.send(createCommand);
    const dkimTokens = createResponse.DkimAttributes?.Tokens || [];

    await this.associateResourceWithTenant(domain, tenantName);

    const verificationRecords = this.buildVerificationRecords(
      domain,
      dkimTokens,
    );

    return {
      isVerified: false,
      verificationRecords,
    };
  }

  private async associateResourceWithTenant(
    domain: string,
    tenantName: string,
  ): Promise<void> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    try {
      await sesClient.send(
        new CreateTenantResourceAssociationCommand({
          TenantName: tenantName,
          ResourceArn: `arn:aws:ses:${this.config.region}:${this.config.accountId}:identity/${domain}`,
        }),
      );
      this.logger.log(`Associated domain ${domain} with tenant ${tenantName}`);
    } catch (error) {
      if (error.name === 'AlreadyExistsException') {
        this.logger.log(
          `Domain ${domain} already associated with tenant ${tenantName}`,
        );

        return;
      }
      throw error;
    }
  }

  private async enableDkimSigning(domain: string): Promise<void> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    const dkimCommand = new PutEmailIdentityDkimAttributesCommand({
      EmailIdentity: domain,
      SigningEnabled: true,
    });

    await sesClient.send(dkimCommand);
    this.logger.log(`Enabled DKIM signing for domain: ${domain}`);
  }

  private buildVerificationRecords(
    domain: string,
    dkimTokens: string[],
  ): VerificationRecord[] {
    return dkimTokens.map((token) => ({
      type: 'CNAME' as const,
      name: `${token}._domainkey.${domain}`,
      value: `${token}.dkim.amazonses.com`,
    }));
  }

  private determineVerificationStatus(identityResponse: {
    VerifiedForSendingStatus?: boolean;
    DkimAttributes?: {
      SigningEnabled?: boolean;
      Status?: string;
    };
  }): OutboundMessageDomainStatus {
    const isVerified = identityResponse.VerifiedForSendingStatus === true;
    const isDkimEnabled =
      identityResponse.DkimAttributes?.SigningEnabled === true;
    const dkimStatus = identityResponse.DkimAttributes?.Status;

    if (isVerified && isDkimEnabled && dkimStatus === 'SUCCESS') {
      return OutboundMessageDomainStatus.VERIFIED;
    }

    if (
      identityResponse.VerifiedForSendingStatus === false ||
      dkimStatus === 'FAILED'
    ) {
      return OutboundMessageDomainStatus.FAILED;
    }

    return OutboundMessageDomainStatus.PENDING;
  }
}
