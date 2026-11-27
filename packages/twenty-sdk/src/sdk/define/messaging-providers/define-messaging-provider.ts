import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { PROVIDER_NAME_PATTERN } from '@/sdk/define/common/constants/provider-name-pattern.constant';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { isValidPostgresUuid } from '@/sdk/define/common/utils/is-valid-postgres-uuid';
import {
  MESSAGING_PROVIDER_CONVERSATION_STYLES,
  type MessagingProviderManifest,
  normalizeMessagingProviderManifest,
  withDeprecatedMessagingProviderReferences,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

const LOGIC_FUNCTION_KEYS = [
  'sendMessageLogicFunction',
  'markThreadAsReadLogicFunction',
  'startConversationLogicFunction',
] as const;

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

  const normalizedConfig = normalizeMessagingProviderManifest(config);
  const { connectionProviderUniversalIdentifier } = normalizedConfig;

  if (!isDefined(connectionProviderUniversalIdentifier)) {
    errors.push(
      'Messaging provider must declare the connectionProviderUniversalIdentifier it uses',
    );
  } else if (!isValidPostgresUuid(connectionProviderUniversalIdentifier)) {
    errors.push(
      `Messaging provider connectionProviderUniversalIdentifier "${connectionProviderUniversalIdentifier}" must be the UUID universalIdentifier of a connection provider in this app.`,
    );
  }

  for (const logicFunctionKey of LOGIC_FUNCTION_KEYS) {
    const universalIdentifier =
      normalizedConfig[`${logicFunctionKey}UniversalIdentifier`];

    if (
      isDefined(universalIdentifier) &&
      !isValidPostgresUuid(universalIdentifier)
    ) {
      errors.push(
        `Messaging provider ${logicFunctionKey}UniversalIdentifier "${universalIdentifier}" must be the UUID universalIdentifier of a logic function in this app.`,
      );
    }
  }

  if (
    isDefined(config.conversationStyle) &&
    !MESSAGING_PROVIDER_CONVERSATION_STYLES.includes(config.conversationStyle)
  ) {
    errors.push(
      `Messaging provider conversationStyle "${config.conversationStyle}" must be one of ${MESSAGING_PROVIDER_CONVERSATION_STYLES.join(', ')}`,
    );
  }

  // Both spellings, so a manifest built by a CLI older than this SDK still reads on older servers.
  return createValidationResult({
    config: withDeprecatedMessagingProviderReferences(config),
    errors,
  });
};
