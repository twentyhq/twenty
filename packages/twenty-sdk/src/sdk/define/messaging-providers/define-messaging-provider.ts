import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { PROVIDER_NAME_PATTERN } from '@/sdk/define/common/constants/provider-name-pattern.constant';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { isValidPostgresUuid } from '@/sdk/define/common/utils/is-valid-postgres-uuid';
import { type MessagingProviderManifest } from 'twenty-shared/application';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

export const defineMessagingProvider: DefineEntity<
  MessagingProviderManifest
> = (config) => {
  const errors: string[] = [];

  if (!isNonEmptyString(config.universalIdentifier)) {
    errors.push('Messaging provider must have a universalIdentifier');
  } else if (!isValidPostgresUuid(config.universalIdentifier)) {
    errors.push(
      `Messaging provider universalIdentifier "${config.universalIdentifier}" must be a UUID. Generate one with \`uuidgen\` or any UUID v4 tool.`,
    );
  }

  if (!isNonEmptyString(config.name)) {
    errors.push('Messaging provider must have a name');
  } else if (!PROVIDER_NAME_PATTERN.test(config.name)) {
    errors.push(
      `Messaging provider name "${config.name}" must match ${PROVIDER_NAME_PATTERN}`,
    );
  }

  if (!isNonEmptyString(config.displayName)) {
    errors.push('Messaging provider must have a displayName');
  }

  if (!isDefined(config.connectionProvider)) {
    errors.push(
      'Messaging provider must declare the connectionProvider it uses',
    );
  } else if (
    !isValidPostgresUuid(config.connectionProvider.universalIdentifier)
  ) {
    errors.push(
      `Messaging provider connectionProvider.universalIdentifier "${config.connectionProvider.universalIdentifier}" must be the UUID universalIdentifier of a connection provider in this app.`,
    );
  }

  if (
    isDefined(config.sendMessageLogicFunction) &&
    !isValidPostgresUuid(config.sendMessageLogicFunction.universalIdentifier)
  ) {
    errors.push(
      `Messaging provider sendMessageLogicFunction.universalIdentifier "${config.sendMessageLogicFunction.universalIdentifier}" must be the UUID universalIdentifier of a logic function in this app.`,
    );
  }

  return createValidationResult({ config, errors });
};
