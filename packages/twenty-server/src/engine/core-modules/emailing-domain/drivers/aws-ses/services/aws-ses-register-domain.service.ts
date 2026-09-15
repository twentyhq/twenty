import { Injectable, Logger } from '@nestjs/common';

import {
  AlreadyExistsException,
  CreateConfigurationSetCommand,
  CreateConfigurationSetEventDestinationCommand,
  CreateTenantResourceAssociationCommand,
  GetEmailIdentityCommand,
  PutEmailIdentityMailFromAttributesCommand,
} from '@aws-sdk/client-sesv2';
import { isNonEmptyString } from '@sniptt/guards';
import { type AwsSesDriverConfig } from 'src/engine/core-modules/emailing-domain/drivers/interfaces/driver-config.interface';

import { AWS_SES_EVENT_BUS_NAME } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-event-bus-name.constant';
import { AWS_SES_MAIL_FROM_SUBDOMAIN } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-mail-from-subdomain.constant';
import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesMailFromDomainService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-mail-from-domain.service';
import { AwsSesObservabilityService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-observability.service';
import { AwsSesOutboundEventDestinationService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-outbound-event-destination.service';

type ProvisionWorkspaceInput = {
  tenantName: string;
  configurationSetName: string;
};

@Injectable()
export class AwsSesRegisterDomainService {
  private readonly logger = new Logger(AwsSesRegisterDomainService.name);

  constructor(
    private readonly awsSesClientProvider: AwsSesClientProvider,
    private readonly awsSesObservabilityService: AwsSesObservabilityService,
    private readonly awsSesOutboundEventDestinationService: AwsSesOutboundEventDestinationService,
    private readonly awsSesMailFromDomainService: AwsSesMailFromDomainService,
  ) {}

  async provisionWorkspaceResources(
    input: ProvisionWorkspaceInput,
    config: AwsSesDriverConfig,
  ): Promise<void> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    const eventBusArn = `arn:aws:events:${config.region}:${config.accountId}:event-bus/${AWS_SES_EVENT_BUS_NAME}`;
    const configurationSetArn = `arn:aws:ses:${config.region}:${config.accountId}:configuration-set/${input.configurationSetName}`;

    await sesClient
      .send(
        new CreateConfigurationSetCommand({
          ConfigurationSetName: input.configurationSetName,
          ReputationOptions: { ReputationMetricsEnabled: true },
          SendingOptions: { SendingEnabled: true },
          SuppressionOptions: { SuppressedReasons: [] },
          Tags: [{ Key: 'managed-by', Value: 'twenty' }],
        }),
      )
      .catch((error) => {
        if (!(error instanceof AlreadyExistsException)) {
          throw error;
        }
      });

    await sesClient
      .send(
        new CreateConfigurationSetEventDestinationCommand({
          ConfigurationSetName: input.configurationSetName,
          EventDestinationName: 'twenty-eventbridge',
          EventDestination: {
            Enabled: true,
            MatchingEventTypes: [
              'SEND',
              'DELIVERY',
              'BOUNCE',
              'COMPLAINT',
              'REJECT',
              'RENDERING_FAILURE',
              'DELIVERY_DELAY',
              'SUBSCRIPTION',
            ],
            EventBridgeDestination: { EventBusArn: eventBusArn },
          },
        }),
      )
      .catch((error) => {
        if (!(error instanceof AlreadyExistsException)) {
          throw error;
        }
      });

    await sesClient
      .send(
        new CreateTenantResourceAssociationCommand({
          TenantName: input.tenantName,
          ResourceArn: configurationSetArn,
        }),
      )
      .catch((error) => {
        if (!(error instanceof AlreadyExistsException)) {
          throw error;
        }
      });

    await this.awsSesOutboundEventDestinationService.upsertEventDestinationOrThrow(
      input.configurationSetName,
    );

    await this.awsSesObservabilityService.addEventDestination(
      input.configurationSetName,
    );

    this.logger.log(
      `Provisioned workspace resources for tenant ${input.tenantName}`,
    );
  }

  async registerDomain(
    domain: string,
    config: AwsSesDriverConfig,
  ): Promise<void> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    const { MailFromAttributes: currentMailFrom } = await sesClient.send(
      new GetEmailIdentityCommand({ EmailIdentity: domain }),
    );

    const shouldKeepCurrentMailFromDomain =
      await this.shouldKeepCurrentMailFromDomain({
        mailFromDomain: currentMailFrom?.MailFromDomain,
        mailFromDomainStatus: currentMailFrom?.MailFromDomainStatus,
        region: config.region,
      });

    if (shouldKeepCurrentMailFromDomain) {
      return;
    }

    const mailFromDomain = await this.awsSesMailFromDomainService
      .findAvailableMailFromDomain({ domain, region: config.region })
      .catch((error) => {
        this.logger.warn(
          `Could not probe the MAIL FROM candidates of ${domain}, using the default one: ${error}`,
        );

        return `${AWS_SES_MAIL_FROM_SUBDOMAIN}.${domain}`;
      });

    if (mailFromDomain === currentMailFrom?.MailFromDomain) {
      return;
    }

    await sesClient.send(
      new PutEmailIdentityMailFromAttributesCommand({
        EmailIdentity: domain,
        MailFromDomain: mailFromDomain,
        BehaviorOnMxFailure: 'USE_DEFAULT_VALUE',
      }),
    );

    this.logger.log(
      `Registered MAIL FROM ${mailFromDomain} for domain ${domain}`,
    );
  }

  private async shouldKeepCurrentMailFromDomain({
    mailFromDomain,
    mailFromDomainStatus,
    region,
  }: {
    mailFromDomain: string | undefined;
    mailFromDomainStatus: string | undefined;
    region: string;
  }): Promise<boolean> {
    if (!isNonEmptyString(mailFromDomain)) {
      return false;
    }

    if (mailFromDomainStatus === 'SUCCESS') {
      return true;
    }

    const usage = await this.awsSesMailFromDomainService
      .getUsage({ mailFromDomain, region })
      .catch(() => undefined);

    switch (usage) {
      case undefined:
      case 'FREE':
      case 'POINTS_TO_SES':
        return true;
      case 'TAKEN':
        return false;
    }
  }
}
