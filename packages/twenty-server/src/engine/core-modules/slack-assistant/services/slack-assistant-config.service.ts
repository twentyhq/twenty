import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import {
  SLACK_SIGNING_SECRET_VARIABLE_KEY,
  TWENTY_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/slack-assistant/constants/slack-assistant.constants';

@Injectable()
export class SlackAssistantConfigService {
  private readonly logger = new Logger(SlackAssistantConfigService.name);

  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly registrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async getSigningSecret(): Promise<string | null> {
    const application = await this.applicationRepository.findOneBy({
      universalIdentifier: TWENTY_SLACK_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    if (
      !isDefined(application) ||
      !isDefined(application.applicationRegistrationId)
    ) {
      this.logger.warn(
        'twenty-slack is not installed (no application registration); cannot resolve the Slack signing secret.',
      );

      return null;
    }

    const variable = await this.registrationVariableRepository.findOne({
      where: {
        applicationRegistrationId: application.applicationRegistrationId,
        key: SLACK_SIGNING_SECRET_VARIABLE_KEY,
      },
    });

    if (!isDefined(variable) || variable.encryptedValue === '') {
      return null;
    }

    return this.secretEncryptionService.decryptVersionedOrThrow(
      variable.encryptedValue,
    );
  }
}
