import { Logger } from '@nestjs/common';

import {
  CreateEmailIdentityCommand,
  CreateTenantCommand,
  CreateTenantResourceAssociationCommand,
  GetEmailIdentityCommand,
  PutEmailIdentityDkimAttributesCommand,
} from '@aws-sdk/client-sesv2';

import { type AwsSesDriverConfig } from 'src/engine/core-modules/emailing-domain/drivers/interfaces/driver-config.interface';
import {
  type DomainStatusInput,
  type DomainVerificationInput,
  type EmailingDomainDriverInterface,
  type EmailingDomainVerificationResult,
} from 'src/engine/core-modules/emailing-domain/drivers/interfaces/emailing-domain-driver.interface';

import { type AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { type AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain';
import { type VerificationRecordDTO } from 'src/engine/core-modules/emailing-domain/dtos/verification-record.dto';

export class AwsSesDriver implements EmailingDomainDriverInterface {
  private readonly logger = new Logger(AwsSesDriver.name);

  constructor(
    private readonly config: AwsSesDriverConfig,
    private readonly awsSesClientProvider: AwsSesClientProvider,
    private readonly awsSesHandleErrorService: AwsSesHandleErrorService,
  ) {}

  async verifyDomain(
    input: DomainVerificationInput,
  ): Promise<EmailingDomainVerificationResult> {
    try {
      this.logger.log(`Starting domain verification for: ${input.domain}`);

      const tenantName = this.generateTenantName(input.workspaceId);

      await this.ensureTenantExists(tenantName);

      const { isVerified, verificationRecords } =
        await this.createOrUpdateEmailIdentity(input.domain, tenantName);

      if (isVerified) {
        await this.enableDkimSigning(input.domain);
      }

      return {
        status: isVerified
          ? EmailingDomainStatus.VERIFIED
          : EmailingDomainStatus.PENDING,
        verifiedAt: isVerified ? new Date() : null,
        verificationRecords,
      };
    } catch (error) {
      this.logger.error(`Failed to verify domain ${input.domain}: ${error}`);
      this.awsSesHandleErrorService.handleAwsSesError(error, 'verifyDomain');
    }
  }

  async getDomainStatus(
    input: DomainStatusInput,
  ): Promise<EmailingDomainVerificationResult> {
    try {
      this.logger.log(`Getting domain status for: ${input.domain}`);

      const sesClient = this.awsSesClientProvider.getSESClient();

      const getIdentityCommand = new GetEmailIdentityCommand({
        EmailIdentity: input.domain,
      });

      const identityResponse = await sesClient.send(getIdentityCommand);

      const status = this.determineVerificationStatus(identityResponse);
      const isFullyVerified = status === EmailingDomainStatus.VERIFIED;
      const verificationRecords = this.buildVerificationRecords(
        input.domain,
        identityResponse.DkimAttributes?.Tokens || [],
      );

      return {
        status,
        verifiedAt: isFullyVerified ? new Date() : null,
        verificationRecords,
      };
    } catch (error) {
      if (error.name === 'NotFoundException') {
        return {
          status: EmailingDomainStatus.FAILED,
          verifiedAt: null,
          verificationRecords: [],
        };
      }

      this.logger.error(
        `Failed to get domain status ${input.domain}: ${error}`,
      );
      this.awsSesHandleErrorService.handleAwsSesError(error, 'getDomainStatus');
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
    verificationRecords: VerificationRecordDTO[];
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
    verificationRecords: VerificationRecordDTO[];
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
  ): VerificationRecordDTO[] {
    return dkimTokens.map((token) => ({
      type: 'CNAME' as const,
      key: `${token}._domainkey.${domain}`,
      value: `${token}.dkim.amazonses.com`,
    }));
  }

  private determineVerificationStatus(identityResponse: {
    VerifiedForSendingStatus?: boolean;
    DkimAttributes?: {
      SigningEnabled?: boolean;
      Status?: string;
    };
  }): EmailingDomainStatus {
    const isVerified = identityResponse.VerifiedForSendingStatus === true;
    const isDkimEnabled =
      identityResponse.DkimAttributes?.SigningEnabled === true;
    const dkimStatus = identityResponse.DkimAttributes?.Status;

    if (isVerified && isDkimEnabled && dkimStatus === 'SUCCESS') {
      return EmailingDomainStatus.VERIFIED;
    }

    if (
      identityResponse.VerifiedForSendingStatus === false ||
      dkimStatus === 'FAILED'
    ) {
      return EmailingDomainStatus.FAILED;
    }

    return EmailingDomainStatus.PENDING;
  }
}
