import { isNonEmptyString } from '@sniptt/guards';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { isValidHttpsUrl } from '@/sdk/define/common/utils/is-valid-https-url';
import { isValidPostgresUuid } from '@/sdk/define/common/utils/is-valid-postgres-uuid';
import {
  type ConnectionProviderManifest,
  type OAuthConnectionProviderIdentityMethod,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const PROVIDER_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
const SUPPORTED_TYPES = ['oauth'] as const;
const DEFAULT_IDENTITY_METHOD = 'GET' as const;
const SUPPORTED_IDENTITY_METHODS = [
  'GET',
  'POST',
] as const satisfies readonly OAuthConnectionProviderIdentityMethod[];

type ConnectionProviderLifecycleHookKey = Extract<
  keyof ConnectionProviderManifest,
  `on${string}LogicFunction`
>;

const LIFECYCLE_HOOK_KEYS = [
  'onConnectLogicFunction',
  'onDisconnectLogicFunction',
] as const satisfies readonly ConnectionProviderLifecycleHookKey[];

export const defineConnectionProvider: DefineEntity<
  ConnectionProviderManifest
> = (config) => {
  const errors: string[] = [];

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

  for (const hookKey of LIFECYCLE_HOOK_KEYS) {
    const hook = config[hookKey];

    if (isDefined(hook) && !isValidPostgresUuid(hook.universalIdentifier)) {
      errors.push(
        `Connection provider ${hookKey}.universalIdentifier "${hook.universalIdentifier}" must be the UUID universalIdentifier of a logic function in this app.`,
      );
    }
  }

  if (!config.type) {
    errors.push("Connection provider must declare a `type` (e.g. 'oauth')");
  } else if (!(SUPPORTED_TYPES as readonly string[]).includes(config.type)) {
    errors.push(
      `Connection provider type "${config.type}" is not supported. Supported types: ${SUPPORTED_TYPES.join(', ')}.`,
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

      const identity = oauth.identity;

      if (isDefined(identity)) {
        if (
          !isNonEmptyString(identity.endpoint) ||
          identity.endpoint.trim() === ''
        ) {
          errors.push(
            'OAuth connection provider identity must have an endpoint (the URL called with the access token to resolve the authorized account)',
          );
        } else if (!isValidHttpsUrl(identity.endpoint)) {
          errors.push(
            `OAuth connection provider identity endpoint "${identity.endpoint}" must be an absolute https URL with no embedded credentials (e.g. https://api.example.com/me)`,
          );
        }

        if (
          !isNonEmptyString(identity.accountIdPath) ||
          identity.accountIdPath.trim() === ''
        ) {
          errors.push(
            'OAuth connection provider identity must have an accountIdPath (dot-delimited path to the account id in the endpoint response, e.g. `user.id`)',
          );
        }

        const method = identity.method ?? DEFAULT_IDENTITY_METHOD;

        if (
          isDefined(identity.method) &&
          !(SUPPORTED_IDENTITY_METHODS as readonly string[]).includes(
            identity.method,
          )
        ) {
          errors.push(
            `OAuth connection provider identity method "${identity.method}" is not supported. Supported methods: ${SUPPORTED_IDENTITY_METHODS.join(', ')}.`,
          );
        }

        if (isNonEmptyString(identity.body) && method === 'GET') {
          errors.push(
            "OAuth connection provider identity `body` is only sent with method 'POST'. Set `method: 'POST'` or remove the body.",
          );
        }
      }
    }
  }

  return createValidationResult({ config, errors });
};
