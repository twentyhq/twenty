import { isDefined } from 'twenty-shared/utils';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

const SERVER_ADMIN_IDENTITY_ASSERTION_VARIABLES = [
  'SERVER_ADMIN_IDENTITY_ASSERTION_HEADER',
  'SERVER_ADMIN_IDENTITY_ASSERTION_JWKS_URL',
  'SERVER_ADMIN_IDENTITY_ASSERTION_ISSUER',
  'SERVER_ADMIN_IDENTITY_ASSERTION_AUDIENCE',
] as const satisfies (keyof ConfigVariables)[];

const REQUIRED_VARIABLES = [
  'SERVER_ADMIN_WORKSPACE_ID',
  ...SERVER_ADMIN_IDENTITY_ASSERTION_VARIABLES,
] as const satisfies (keyof ConfigVariables)[];

// The identity assertion is all or nothing: setting one of its variables requires the others and the workspace id.
export const getMissingServerAdminIdentityAssertionVariables = (
  configVariables: Pick<ConfigVariables, (typeof REQUIRED_VARIABLES)[number]>,
): (typeof REQUIRED_VARIABLES)[number][] => {
  const isIdentityAssertionConfigured =
    SERVER_ADMIN_IDENTITY_ASSERTION_VARIABLES.some((variable) =>
      isDefined(configVariables[variable]),
    );

  if (!isIdentityAssertionConfigured) {
    return [];
  }

  return REQUIRED_VARIABLES.filter(
    (variable) => !isDefined(configVariables[variable]),
  );
};
