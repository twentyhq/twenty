import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type ConnectionProviderManifest } from 'twenty-shared/application';

const PROVIDER_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

// Defines a connection provider — describes how a user's third-party
// credentials for an external service are obtained, stored, and refreshed.
//
// Today only `type: 'oauth'` is supported. Future credential types (PATs,
// API keys, basic auth) add new `type` values + their own sub-config block
// — purely additive, app developers using `type: 'oauth'` never need to
// migrate.
export const defineConnectionProvider: DefineEntity<
  ConnectionProviderManifest
> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('Connection provider must have a universalIdentifier');
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

  if (!config.type) {
    errors.push("Connection provider must declare a `type` (e.g. 'oauth')");
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
          'OAuth connection provider must reference a clientIdVariable (key of an applicationRegistrationVariable)',
        );
      }
      if (!oauth.clientSecretVariable) {
        errors.push(
          'OAuth connection provider must reference a clientSecretVariable (key of an applicationRegistrationVariable)',
        );
      }
      if (!Array.isArray(oauth.scopes)) {
        errors.push('OAuth connection provider must declare a scopes array');
      }
    }
  }

  return createValidationResult({ config, errors });
};
