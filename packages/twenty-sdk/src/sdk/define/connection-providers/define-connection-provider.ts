import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { PROVIDER_NAME_PATTERN } from '@/sdk/define/common/constants/provider-name-pattern.constant';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { isValidPostgresUuid } from '@/sdk/define/common/utils/is-valid-postgres-uuid';
import {
  CONNECTION_PROVIDER_SCOPES,
  type ConnectionProviderManifest,
  type CustomConnectionProviderConfig,
  type InteractiveConnectionProviderConfig,
  normalizeConnectionProviderManifest,
  withDeprecatedConnectionProviderReferences,
} from 'twenty-shared/application';
import { isDefined, isHttpUrl } from 'twenty-shared/utils';

const SUPPORTED_TYPES = [
  'oauth',
  'oauth-discovery',
  'custom',
  'api-key',
  'interactive',
] as const;

type ConnectionProviderLogicFunctionKey = Extract<
  keyof ConnectionProviderManifest,
  `${string}LogicFunction`
>;

const LOGIC_FUNCTION_KEYS = [
  'identifyAccountLogicFunction',
  'onConnectLogicFunction',
  'onDisconnectLogicFunction',
] as const satisfies readonly ConnectionProviderLogicFunctionKey[];

const CUSTOM_LOGIC_FUNCTION_KEYS = [
  'authorizeLogicFunction',
  'callbackLogicFunction',
] as const;

const getInvalidLogicFunctionReferenceError = ({
  path,
  universalIdentifier,
}: {
  path: string;
  universalIdentifier: string;
}): string | null =>
  isValidPostgresUuid(universalIdentifier)
    ? null
    : `Connection provider ${path}UniversalIdentifier "${universalIdentifier}" must be the UUID universalIdentifier of a logic function in this app.`;

const getCustomConfigErrors = (
  custom: CustomConnectionProviderConfig | undefined,
): string[] => {
  if (!isDefined(custom)) {
    return [
      "Connection provider with type 'custom' must declare a `custom` config block",
    ];
  }

  return CUSTOM_LOGIC_FUNCTION_KEYS.flatMap((logicFunctionKey) => {
    const universalIdentifier =
      custom[`${logicFunctionKey}UniversalIdentifier`];

    if (!isDefined(universalIdentifier)) {
      return [
        `Custom connection provider must declare custom.${logicFunctionKey}UniversalIdentifier`,
      ];
    }

    const referenceError = getInvalidLogicFunctionReferenceError({
      path: `custom.${logicFunctionKey}`,
      universalIdentifier,
    });

    return isDefined(referenceError) ? [referenceError] : [];
  });
};

const getInteractiveConfigErrors = (
  interactive: InteractiveConnectionProviderConfig | undefined,
): string[] => {
  if (!isDefined(interactive)) {
    return [
      "Connection provider with type 'interactive' must declare an `interactive` config block",
    ];
  }

  if (!isDefined(interactive.stepLogicFunctionUniversalIdentifier)) {
    return [
      'Interactive connection provider must declare interactive.stepLogicFunctionUniversalIdentifier',
    ];
  }

  const referenceError = getInvalidLogicFunctionReferenceError({
    path: 'interactive.stepLogicFunction',
    universalIdentifier: interactive.stepLogicFunctionUniversalIdentifier,
  });

  return isDefined(referenceError) ? [referenceError] : [];
};

export const defineConnectionProvider: DefineEntity<
  ConnectionProviderManifest
> = (config) => {
  const errors: string[] = [];
  const normalizedConfig = normalizeConnectionProviderManifest(config);

  if (!config.universalIdentifier) {
    errors.push('Connection provider must have a universalIdentifier');
  } else if (!isValidPostgresUuid(config.universalIdentifier)) {
    errors.push(
      `Connection provider universalIdentifier "${config.universalIdentifier}" must be a UUID. Generate one with \`uuidgen\` or any UUID v4 tool.`,
    );
  }

  if (!config.name) {
    errors.push('Connection provider must have a name');
  } else if (!PROVIDER_NAME_PATTERN.test(config.name)) {
    errors.push(
      `Connection provider name "${config.name}" must match ${PROVIDER_NAME_PATTERN} (used in URLs)`,
    );
  }

  if (!config.displayName) {
    errors.push('Connection provider must have a displayName');
  }

  for (const logicFunctionKey of LOGIC_FUNCTION_KEYS) {
    const universalIdentifier =
      normalizedConfig[`${logicFunctionKey}UniversalIdentifier`];
    const referenceError = isDefined(universalIdentifier)
      ? getInvalidLogicFunctionReferenceError({
          path: logicFunctionKey,
          universalIdentifier,
        })
      : null;

    if (isDefined(referenceError)) {
      errors.push(referenceError);
    }
  }

  if (!config.type) {
    errors.push("Connection provider must declare a `type` (e.g. 'oauth')");
  } else if (!(SUPPORTED_TYPES as readonly string[]).includes(config.type)) {
    errors.push(
      `Connection provider type "${config.type}" is not supported. Supported types: ${SUPPORTED_TYPES.join(', ')}.`,
    );
  }

  if (
    isDefined(config.scope) &&
    !CONNECTION_PROVIDER_SCOPES.includes(config.scope)
  ) {
    errors.push(
      `Connection provider scope must be one of ${CONNECTION_PROVIDER_SCOPES.join(', ')}`,
    );
  }

  if (config.type === 'oauth') {
    const oauth = config.oauth;

    if (!oauth) {
      errors.push(
        "Connection provider with type 'oauth' must declare an `oauth` config block",
      );
    } else {
      if (!oauth.authorizationEndpoint) {
        errors.push(
          'OAuth connection provider must have an authorizationEndpoint',
        );
      }
      if (!oauth.tokenEndpoint) {
        errors.push('OAuth connection provider must have a tokenEndpoint');
      }
      if (!oauth.clientIdVariable) {
        errors.push(
          'OAuth connection provider must reference a clientIdVariable (key of a serverVariable on defineApplication)',
        );
      }
      if (!oauth.clientSecretVariable) {
        errors.push(
          'OAuth connection provider must reference a clientSecretVariable (key of a serverVariable on defineApplication)',
        );
      }
      if (!Array.isArray(oauth.scopes)) {
        errors.push('OAuth connection provider must declare a scopes array');
      }
    }
  }

  if (
    config.type === 'oauth-discovery' &&
    !isHttpUrl(config.oauthDiscovery?.resourceUrl ?? '')
  ) {
    errors.push(
      "Connection provider with type 'oauth-discovery' must declare oauthDiscovery.resourceUrl as an HTTP or HTTPS URL",
    );
  }

  if (normalizedConfig.type === 'custom') {
    errors.push(...getCustomConfigErrors(normalizedConfig.custom));
  }

  if (config.type === 'interactive') {
    errors.push(...getInteractiveConfigErrors(config.interactive));
  }

  // Both spellings, so a manifest built by a CLI older than this SDK still reads on older servers.
  return createValidationResult({
    config: withDeprecatedConnectionProviderReferences(config),
    errors,
  });
};
