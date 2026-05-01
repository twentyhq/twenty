import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type OAuthProviderManifest } from 'twenty-shared/application';

const PROVIDER_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

export const defineOAuthProvider: DefineEntity<OAuthProviderManifest> = (
  config,
) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('OAuth provider must have a universalIdentifier');
  }

  if (!config.name) {
    errors.push('OAuth provider must have a name');
  } else if (!PROVIDER_NAME_PATTERN.test(config.name)) {
    errors.push(
      `OAuth provider name "${config.name}" must match ${PROVIDER_NAME_PATTERN} (used in URLs)`,
    );
  }

  if (!config.displayName) {
    errors.push('OAuth provider must have a displayName');
  }

  if (!config.authorizationEndpoint) {
    errors.push('OAuth provider must have an authorizationEndpoint');
  }

  if (!config.tokenEndpoint) {
    errors.push('OAuth provider must have a tokenEndpoint');
  }

  if (!config.clientIdVariable) {
    errors.push(
      'OAuth provider must reference a clientIdVariable (key of an applicationVariable)',
    );
  }

  if (!config.clientSecretVariable) {
    errors.push(
      'OAuth provider must reference a clientSecretVariable (key of an applicationVariable)',
    );
  }

  if (!config.connectionMode) {
    errors.push(
      'OAuth provider must declare a connectionMode ("per-user" or "per-workspace")',
    );
  }

  if (!Array.isArray(config.scopes)) {
    errors.push('OAuth provider must declare a scopes array');
  }

  return createValidationResult({ config, errors });
};
