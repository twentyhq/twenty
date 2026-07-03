import { Injectable } from '@nestjs/common';

import {
  AlreadyExistsException,
  CreateConfigurationSetEventDestinationCommand,
} from '@aws-sdk/client-sesv2';

import { isDefined } from 'twenty-shared/utils';

import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class AwsSesObservabilityService {
  constructor(
    private readonly awsSesClientProvider: AwsSesClientProvider,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async addEventDestination(configurationSetName: string): Promise<void> {
    const tatamiSnsTopicArn = this.twentyConfigService.get(
      'TATAMI_SNS_TOPIC_ARN',
    );

    if (!isDefined(tatamiSnsTopicArn)) {
      return;
    }

    const sesClient = this.awsSesClientProvider.getSESClient();

    await sesClient
      .send(
        new CreateConfigurationSetEventDestinationCommand({
          ConfigurationSetName: configurationSetName,
          EventDestinationName: 'tatami-sns',
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
            ],
            SnsDestination: { TopicArn: tatamiSnsTopicArn },
          },
        }),
      )
      .catch((error) => {
        if (!(error instanceof AlreadyExistsException)) {
          throw error;
        }
      });
  }
}
