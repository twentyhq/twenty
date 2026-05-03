import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type ConnectionProviderManifest } from 'twenty-shared/application';

const PROVIDER_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
// Matches UUID v1–v5 (and the `00000000-…` Nil UUID). Mirrors the server-side
// check that runs against the `uuid` Postgres column; catching this at SDK
// build time means a typo in `defineConnectionProvider({ universalIdentifier })`
// fails the dev's `twenty deploy` rather than blowing up at install time.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SUPPORTED_TYPES = ['oauth'] as const;

export const defineConnectionProvider: DefineEntity<
  ConnectionProviderManifest
> = (config) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('Connection provider must have a universalIdentifier');
  } else if (!UUID_PATTERN.test(config.universalIdentifier)) {
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
    }
  }

  return createValidationResult({ config, errors });
};
