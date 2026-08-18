import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import {
  ONBOARDING_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
  ONBOARDING_SLACK_CONNECTION_PROVIDER_NAME,
} from 'src/engine/core-modules/onboarding/constants/onboarding-slack-application.constant';
import { getOAuthConnectionProviderManifest } from 'src/engine/core-modules/onboarding/utils/get-oauth-connection-provider-manifest.util';

@Injectable()
export class OnboardingSlackAvailabilityService {
  private readonly logger = new Logger(OnboardingSlackAvailabilityService.name);

  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly connectionProviderService: ConnectionProviderService,
  ) {}

  // The step is only worth offering when this instance can actually complete a
  // Slack OAuth flow, which needs the client credentials filled in on the
  // application registration by a server administrator. Slack's OAuth client is
  // instance-wide, so this is never a per-workspace answer.
  async isSlackConnectAvailable(): Promise<boolean> {
    try {
      const registration =
        await this.applicationRegistrationRepository.findOneBy({
          universalIdentifier:
            ONBOARDING_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
        });

      if (!isDefined(registration)) {
        return false;
      }

      const connectionProviderManifest = getOAuthConnectionProviderManifest({
        manifest: registration.manifest,
        providerName: ONBOARDING_SLACK_CONNECTION_PROVIDER_NAME,
      });

      if (!isDefined(connectionProviderManifest)) {
        return false;
      }

      return await this.connectionProviderService.areRegistrationClientCredentialsConfigured(
        {
          applicationRegistrationId: registration.id,
          clientIdVariable: connectionProviderManifest.oauth.clientIdVariable,
          clientSecretVariable:
            connectionProviderManifest.oauth.clientSecretVariable,
        },
      );
    } catch (error) {
      this.logger.error(
        'Failed to resolve whether Slack can be connected on this instance',
        error,
      );

      return false;
    }
  }
}
