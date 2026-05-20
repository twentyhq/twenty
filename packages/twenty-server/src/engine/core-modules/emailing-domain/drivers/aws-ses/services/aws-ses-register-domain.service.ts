import { Injectable, Logger } from '@nestjs/common';

import {
  CreateConfigurationSetCommand,
  CreateConfigurationSetEventDestinationCommand,
  CreateContactListCommand,
  CreateTenantResourceAssociationCommand,
  GetConfigurationSetCommand,
  NotFoundException,
  PutEmailIdentityMailFromAttributesCommand,
  type SESv2Client,
} from '@aws-sdk/client-sesv2';
import { type AwsSesDriverConfig } from 'src/engine/core-modules/emailing-domain/drivers/interfaces/driver-config.interface';

import { AWS_SES_EVENT_BUS_NAME } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-event-bus-name.constant';
import { AWS_SES_MAIL_FROM_SUBDOMAIN } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-mail-from-subdomain.constant';
import { AWS_SES_MARKETING_TOPIC_NAME } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-marketing-topic-name.constant';
import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';

type RegisterDomainInput = {
  domain: string;
  tenantName: string;
  configurationSetName: string;
  contactListName: string;
};

@Injectable()
export class AwsSesRegisterDomainService {
  private readonly logger = new Logger(AwsSesRegisterDomainService.name);

  constructor(private readonly awsSesClientProvider: AwsSesClientProvider) {}

  async registerDomain(
    input: RegisterDomainInput,
    config: AwsSesDriverConfig,
  ): Promise<void> {
    const sesClient = this.awsSesClientProvider.getSESClient();

    const isWorkspaceAlreadyRegistered = await this.isWorkspaceRegistered(
      sesClient,
      input.configurationSetName,
    );

    if (!isWorkspaceAlreadyRegistered) {
      await this.registerWorkspaceResources(sesClient, input, config);
    }

    await sesClient.send(
      new PutEmailIdentityMailFromAttributesCommand({
        EmailIdentity: input.domain,
        MailFromDomain: `${AWS_SES_MAIL_FROM_SUBDOMAIN}.${input.domain}`,
        BehaviorOnMxFailure: 'USE_DEFAULT_VALUE',
      }),
    );

    this.logger.log(
      `Registered domain ${input.domain} on tenant ${input.tenantName}`,
    );
  }

  private async isWorkspaceRegistered(
    sesClient: SESv2Client,
    configurationSetName: string,
  ): Promise<boolean> {
    try {
      await sesClient.send(
        new GetConfigurationSetCommand({
          ConfigurationSetName: configurationSetName,
        }),
      );

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
  }

  private async registerWorkspaceResources(
    sesClient: SESv2Client,
    input: RegisterDomainInput,
    config: AwsSesDriverConfig,
  ): Promise<void> {
    const eventBusArn = `arn:aws:events:${config.region}:${config.accountId}:event-bus/${AWS_SES_EVENT_BUS_NAME}`;
    const configurationSetArn = `arn:aws:ses:${config.region}:${config.accountId}:configuration-set/${input.configurationSetName}`;

    await sesClient.send(
      new CreateConfigurationSetCommand({
        ConfigurationSetName: input.configurationSetName,
        ReputationOptions: { ReputationMetricsEnabled: true },
        SendingOptions: { SendingEnabled: true },
        SuppressionOptions: { SuppressedReasons: ['BOUNCE', 'COMPLAINT'] },
        Tags: [{ Key: 'managed-by', Value: 'twenty' }],
      }),
    );

    await sesClient.send(
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
    );

    await sesClient.send(
      new CreateContactListCommand({
        ContactListName: input.contactListName,
        Topics: [
          {
            TopicName: AWS_SES_MARKETING_TOPIC_NAME,
            DisplayName: 'Marketing',
            DefaultSubscriptionStatus: 'OPT_IN',
          },
        ],
        Tags: [{ Key: 'managed-by', Value: 'twenty' }],
      }),
    );

    await sesClient.send(
      new CreateTenantResourceAssociationCommand({
        TenantName: input.tenantName,
        ResourceArn: configurationSetArn,
      }),
    );
  }
}
