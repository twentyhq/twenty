import { Logger } from '@nestjs/common';

import {
  CreateEmailIdentityCommand,
  GetEmailIdentityCommand,
  PutEmailIdentityDkimAttributesCommand,
} from '@aws-sdk/client-sesv2';

import { type AwsSesDriverConfig } from 'src/engine/core-modules/outbound-message-domain/drivers/interfaces/driver-config.interface';
import { type OutboundMessageDomainDriverInterface } from 'src/engine/core-modules/outbound-message-domain/drivers/interfaces/outbound-message-domain-driver.interface';

import { type AwsSesClientProvider } from 'src/engine/core-modules/outbound-message-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { type AwsSesHandleErrorService } from 'src/engine/core-modules/outbound-message-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import {
  OutboundMessageDomainStatus,
  OutboundMessageDomainSyncStatus,
} from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';
import { type OutboundMessageDomain } from 'src/engine/core-modules/outbound-message-domain/outbound-message-domain.entity';

export class AwsSesDriver
  implements OutboundMessageDomainDriverInterface<AwsSesDriverConfig>
{
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

      const sesClient = this.awsSesClientProvider.getSESClient();

      // Check if domain identity already exists
      let isVerified = false;
      let verificationToken: string | undefined;

      try {
        const getIdentityCommand = new GetEmailIdentityCommand({
          EmailIdentity: domain.domain,
        });
        const identityResponse = await sesClient.send(getIdentityCommand);

        isVerified = identityResponse.VerifiedForSendingStatus === true;

        // If not verified, we need to create/recreate the identity
        if (!isVerified) {
          const createCommand = new CreateEmailIdentityCommand({
            EmailIdentity: domain.domain,
          });
          const createResponse = await sesClient.send(createCommand);

          verificationToken = createResponse.DkimAttributes?.Tokens?.[0];
        }
      } catch (error) {
        // If identity doesn't exist, create it
        if (error.name === 'NotFoundException') {
          const createCommand = new CreateEmailIdentityCommand({
            EmailIdentity: domain.domain,
          });
          const createResponse = await sesClient.send(createCommand);

          verificationToken = createResponse.DkimAttributes?.Tokens?.[0];
        } else {
          throw error;
        }
      }

      // Enable DKIM if verified
      if (isVerified) {
        const dkimCommand = new PutEmailIdentityDkimAttributesCommand({
          EmailIdentity: domain.domain,
          SigningEnabled: true,
        });

        await sesClient.send(dkimCommand);
      }

      return {
        ...domain,
        status: isVerified
          ? OutboundMessageDomainStatus.VERIFIED
          : OutboundMessageDomainStatus.PENDING,
        verifiedAt: isVerified ? new Date() : null,
        verificationToken: verificationToken || domain.verificationToken,
        syncStatus: OutboundMessageDomainSyncStatus.SYNCED,
        lastSyncedAt: new Date(),
        syncError: null,
      };
    } catch (error) {
      this.logger.error(`Failed to verify domain ${domain.domain}: ${error}`);
      this.awsSesHandleErrorService.handleAwsSesError(error, 'verifyDomain');

      return {
        ...domain,
        status: OutboundMessageDomainStatus.FAILED,
        syncStatus: OutboundMessageDomainSyncStatus.FAILED,
        syncError:
          error instanceof Error ? error.message : 'Unknown verification error',
      };
    }
  }

  async getDomainStatus(
    domain: OutboundMessageDomain,
  ): Promise<OutboundMessageDomain> {
    try {
      this.logger.log(`Starting domain sync for: ${domain.domain}`);

      const sesClient = this.awsSesClientProvider.getSESClient();

      // Get email identity status
      const getIdentityCommand = new GetEmailIdentityCommand({
        EmailIdentity: domain.domain,
      });

      const identityResponse = await sesClient.send(getIdentityCommand);

      const isVerified = identityResponse.VerifiedForSendingStatus === true;
      const isDkimEnabled =
        identityResponse.DkimAttributes?.SigningEnabled === true;
      const dkimVerificationStatus = identityResponse.DkimAttributes?.Status;

      let status = OutboundMessageDomainStatus.PENDING;

      if (isVerified && isDkimEnabled && dkimVerificationStatus === 'SUCCESS') {
        status = OutboundMessageDomainStatus.VERIFIED;
      } else if (
        identityResponse.VerifiedForSendingStatus === false ||
        dkimVerificationStatus === 'FAILED'
      ) {
        status = OutboundMessageDomainStatus.FAILED;
      }

      return {
        ...domain,
        status,
        verifiedAt:
          isVerified && status === OutboundMessageDomainStatus.VERIFIED
            ? domain.verifiedAt || new Date()
            : null,
        syncStatus: OutboundMessageDomainSyncStatus.SYNCED,
        lastSyncedAt: new Date(),
        syncError: null,
      };
    } catch (error) {
      this.logger.error(`Failed to sync domain ${domain.domain}: ${error}`);
      this.awsSesHandleErrorService.handleAwsSesError(error, 'syncDomain');
    }
  }

  async getDomainVerificationRecords(domainName: string): Promise<string> {
    try {
      this.logger.log(`Getting verification token for domain: ${domainName}`);

      const sesClient = this.awsSesClientProvider.getSESClient();

      // Create email identity to get DKIM tokens
      const createCommand = new CreateEmailIdentityCommand({
        EmailIdentity: domainName,
      });

      const response = await sesClient.send(createCommand);

      // SESv2 returns DKIM tokens instead of a single verification token
      const dkimTokens = response.DkimAttributes?.Tokens;

      if (!dkimTokens || dkimTokens.length === 0) {
        throw new Error('No DKIM tokens returned from AWS SESv2');
      }

      // Return the first DKIM token as the verification token
      return dkimTokens[0];
    } catch (error) {
      this.logger.error(
        `Failed to get verification token for ${domainName}: ${error}`,
      );
      this.awsSesHandleErrorService.handleAwsSesError(
        error,
        'getDomainVerificationToken',
      );
      throw error;
    }
  }
}
