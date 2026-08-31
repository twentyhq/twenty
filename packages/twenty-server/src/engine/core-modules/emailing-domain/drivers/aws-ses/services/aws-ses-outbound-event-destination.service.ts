import { Injectable, Logger } from '@nestjs/common';

import {
  AlreadyExistsException,
  CreateConfigurationSetEventDestinationCommand,
  type EventDestinationDefinition,
  UpdateConfigurationSetEventDestinationCommand,
} from '@aws-sdk/client-sesv2';
import { isNonEmptyString } from '@sniptt/guards';

import { AWS_SES_OUTBOUND_EVENT_DESTINATION_NAME } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-outbound-event-destination-name.constant';
import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class AwsSesOutboundEventDestinationService {
  private readonly logger = new Logger(
    AwsSesOutboundEventDestinationService.name,
  );

  constructor(
    private readonly awsSesClientProvider: AwsSesClientProvider,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async upsertEventDestinationOrThrow(
    configurationSetName: string,
  ): Promise<void> {
    const topicArn = this.twentyConfigService.get('SES_OUTBOUND_SNS_TOPIC_ARN');

    if (!isNonEmptyString(topicArn)) {
      this.logger.warn(
        'SES_OUTBOUND_SNS_TOPIC_ARN is not configured, so delivery, reject and rendering-failure events will not reach the outbound webhook. Bounces and complaints still arrive through the EventBridge subscription.',
      );

      return;
    }

    const eventDestination: EventDestinationDefinition = {
      Enabled: true,
      MatchingEventTypes: [
        'DELIVERY',
        'BOUNCE',
        'COMPLAINT',
        'REJECT',
        'RENDERING_FAILURE',
      ],
      SnsDestination: { TopicArn: topicArn },
    };

    const sesClient = this.awsSesClientProvider.getSESClient();

    await sesClient
      .send(
        new CreateConfigurationSetEventDestinationCommand({
          ConfigurationSetName: configurationSetName,
          EventDestinationName: AWS_SES_OUTBOUND_EVENT_DESTINATION_NAME,
          EventDestination: eventDestination,
        }),
      )
      .catch(async (error) => {
        if (!(error instanceof AlreadyExistsException)) {
          throw error;
        }

        await sesClient.send(
          new UpdateConfigurationSetEventDestinationCommand({
            ConfigurationSetName: configurationSetName,
            EventDestinationName: AWS_SES_OUTBOUND_EVENT_DESTINATION_NAME,
            EventDestination: eventDestination,
          }),
        );
      });
  }
}
