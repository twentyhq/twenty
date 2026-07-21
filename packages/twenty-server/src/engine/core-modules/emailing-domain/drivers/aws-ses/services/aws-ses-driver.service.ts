import { Logger } from '@nestjs/common';

import {
  AlreadyExistsException,
  CreateEmailIdentityCommand,
  CreateTenantCommand,
  CreateTenantResourceAssociationCommand,
  DeleteConfigurationSetCommand,
  DeleteEmailIdentityCommand,
  DeleteTenantCommand,
  DeleteTenantResourceAssociationCommand,
  GetEmailIdentityCommand,
  NotFoundException,
  PutEmailIdentityDkimAttributesCommand,
} from '@aws-sdk/client-sesv2';

import { isNonEmptyString } from '@sniptt/guards';

import { type AwsSesDriverConfig } from 'src/engine/core-modules/emailing-domain/drivers/interfaces/driver-config.interface';
import {
  type EmailingDomainDriverInterface,
  type EmailingDomainResourceInput,
  type EmailingDomainVerificationResult,
} from 'src/engine/core-modules/emailing-domain/drivers/interfaces/emailing-domain-driver.interface';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type EmailingDomainSendEmailRequest } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type UnsubscribeContentService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-content.service';

import { AWS_SES_RESOURCE_NAME_PREFIX } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-resource-name-prefix.constant';
import { type AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesRegisterDomainService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-register-domain.service';
import { type AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { type AwsSesSendEmailService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-send-email.service';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type VerificationRecordDTO } from 'src/engine/core-modules/emailing-domain/dtos/verification-record.dto';

export class AwsSesDriver implements EmailingDomainDriverInterface {
  private readonly logger = new Logger(AwsSesDriver.name);

  constructor(
    private readonly config: AwsSesDriverConfig,
    private readonly awsSesClientProvider: AwsSesClientProvider,
    private readonly awsSesHandleErrorService: AwsSesHandleErrorService,
    private readonly awsSesRegisterDomainService: AwsSesRegisterDomainService,
    private readonly awsSesSendEmailService: AwsSesSendEmailService,
    private readonly unsubscribeContentService: UnsubscribeContentService,
  ) {}

  async verifyDomain(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult> {
    try {
      this.logger.log(`Starting domain verification for: ${input.domain}`);

      const tenantName = this.buildTenantName(input.workspaceId);

      const { isVerified, status, verificationRecords } =
        await this.createOrUpdateEmailIdentity(input.domain, tenantName);

      if (isVerified) {
        await this.enableDkimSigning(input.domain);
      }

      return {
        status,
        verificationRecords: this.withRecordStatus(verificationRecords, status),
      };
    } catch (error) {
      this.logger.error(`Failed to verify domain ${input.domain}: ${error}`);
      this.awsSesHandleErrorService.handleAwsSesError(error, 'verifyDomain');
    }
  }

  async getDomainStatus(
    input: EmailingDomainResourceInput,
  ): Promise<EmailingDomainVerificationResult> {
    try {
      this.logger.log(`Getting domain status for: ${input.domain}`);

      const sesClient = this.awsSesClientProvider.getSESClient();

      const getIdentityCommand = new GetEmailIdentityCommand({
        EmailIdentity: input.domain,
      });

      const identityResponse = await sesClient.send(getIdentityCommand);

      const status = this.determineVerificationStatus(identityResponse);
      const verificationRecords = this.buildVerificationRecords(
        input.domain,
        identityResponse.DkimAttributes?.Tokens || [],
      );

      return {
        status,
        verificationRecords: this.withRecordStatus(verificationRecords, status),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: EmailingDomainStatus.FAILED,
          verificationRecords: [],
        };
      }

      this.logger.error(
        `Failed to get domain status ${input.domain}: ${error}`,
      );
      this.awsSesHandleErrorService.handleAwsSesError(error, 'getDomainStatus');
    }
  }

  async provisionWorkspace(workspaceId: string): Promise<void> {
    const tenantName = this.buildTenantName(workspaceId);

    await this.ensureTenantExists(tenantName);

    await this.awsSesRegisterDomainService.provisionWorkspaceResources(
      {
        tenantName,
        configurationSetName: this.buildConfigurationSetName(workspaceId),
      },
      this.config,
    );
  }

  async registerDomain(input: EmailingDomainResourceInput): Promise<void> {
    await this.awsSesRegisterDomainService.registerDomain(input.domain);
  }

  async sendEmail(
    input: EmailingDomainSendEmailRequest,
  ): Promise<EmailingDomainSendEmailResult> {
    const unsubscribeBaseUrl = this.getUnsubscribeBaseUrl(input.emailingDomain);
    const emailToSend = this.unsubscribeContentService.addTo(
      input,
      unsubscribeBaseUrl,
    );

    return this.awsSesSendEmailService.sendEmail(emailToSend, {
      tenantName: this.buildTenantName(input.workspaceId),
      configurationSetName: this.buildConfigurationSetName(input.workspaceId),
    });
  }

  private getUnsubscribeBaseUrl(emailingDomain: EmailingDomainEntity): string {
    if (
      emailingDomain.unsubscribeHostnameStatus !==
        UnsubscribeHostnameStatus.ACTIVE ||
      !isNonEmptyString(emailingDomain.unsubscribeHostname)
    ) {
      throw new EmailingDomainDriverException(
        `Cannot send email for ${emailingDomain.domain}: unsubscribe domain is not active (status: ${emailingDomain.unsubscribeHostnameStatus})`,
        EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY,
      );
    }

    return `https://${emailingDomain.unsubscribeHostname}`;
  }

  async cleanupDomain(input: EmailingDomainResourceInput): Promise<void> {
    const sesClient = this.awsSesClientProvider.getSESClient();
    const tenantName = this.buildTenantName(input.workspaceId);
    const identityArn = `arn:aws:ses:${this.config.region}:${this.config.accountId}:identity/${input.domain}`;

    await sesClient
      .send(
        new DeleteTenantResourceAssociationCommand({
          TenantName: tenantName,
          ResourceArn: identityArn,
        }),
      )
      .catch((error) => {
        if (!(error instanceof NotFoundException)) throw error;
      });

    await sesClient
      .send(new DeleteEmailIdentityCommand({ EmailIdentity: input.domain }))
      .catch((error) => {
        if (!(error instanceof NotFoundException)) throw error;
      });
  }

  async deprovisionWorkspace(workspaceId: string): Promise<void> {
    const sesClient = this.awsSesClientProvider.getSESClient();
    const tenantName = this.buildTenantName(workspaceId);
    const configurationSetName = this.buildConfigurationSetName(workspaceId);
    const configurationSetArn = `arn:aws:ses:${this.config.region}:${this.config.accountId}:configuration-set/${configurationSetName}`;

    await sesClient
      .send(
        new DeleteTenantResourceAssociationCommand({
          TenantName: tenantName,
          ResourceArn: configurationSetArn,
        }),
      )
      .catch((error) => {
        if (!(error instanceof NotFoundException)) throw error;
      });

    await sesClient
      .send(
        new DeleteConfigurationSetCommand({
          ConfigurationSetName: configurationSetName,
        }),
      )
      .catch((error) => {
        if (!(error instanceof NotFoundException)) throw error;
      });

    await sesClient
      .send(new DeleteTenantCommand({ TenantName: tenantName }))
      .catch((error) => {
        if (!(error instanceof NotFoundException)) throw error;
      });
  }

  private buildTenantName(workspaceId: string): string {
    return `${AWS_SES_RESOURCE_NAME_PREFIX}-${workspaceId}`;
  }

  private buildConfigurationSetName(workspaceId: string): string {
    return `${AWS_SES_RESOURCE_NAME_PREFIX}-${workspaceId}`;
  }

  private async ensureTenantExists(tenantName: string): Promise<void> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    try {
      await sesClient.send(new CreateTenantCommand({ TenantName: tenantName }));
      this.logger.log(`Created tenant: ${tenantName}`);
    } catch (error) {
      if (error instanceof AlreadyExistsException) {
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
    status: EmailingDomainStatus;
    verificationRecords: VerificationRecordDTO[];
  }> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    try {
      const getIdentityCommand = new GetEmailIdentityCommand({
        EmailIdentity: domain,
      });
      const existingIdentity = await sesClient.send(getIdentityCommand);

      const isVerified = existingIdentity.VerifiedForSendingStatus === true;
      const status = this.determineVerificationStatus(existingIdentity);
      const verificationRecords = this.buildVerificationRecords(
        domain,
        existingIdentity.DkimAttributes?.Tokens || [],
      );

      await this.associateResourceWithTenant(domain, tenantName);

      return { isVerified, status, verificationRecords };
    } catch (error) {
      if (error instanceof NotFoundException) {
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
    status: EmailingDomainStatus;
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
      status: EmailingDomainStatus.PENDING,
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
      if (error instanceof AlreadyExistsException) {
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

  private withRecordStatus(
    records: VerificationRecordDTO[],
    status: EmailingDomainStatus,
  ): VerificationRecordDTO[] {
    const recordStatus =
      status === EmailingDomainStatus.VERIFIED
        ? 'success'
        : status === EmailingDomainStatus.FAILED
          ? 'error'
          : 'pending';

    return records.map((record) => ({ ...record, status: recordStatus }));
  }
}
