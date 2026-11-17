import { getMissingServerAdminIdentityAssertionVariables } from 'src/engine/core-modules/twenty-config/utils/get-missing-server-admin-identity-assertion-variables.util';

const COMPLETE_CONFIG_VARIABLES = {
  SERVER_ADMIN_WORKSPACE_ID: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  SERVER_ADMIN_IDENTITY_ASSERTION_HEADER: 'Cf-Access-Jwt-Assertion',
  SERVER_ADMIN_IDENTITY_ASSERTION_JWKS_URL: 'https://identity-proxy.test/keys',
  SERVER_ADMIN_IDENTITY_ASSERTION_ISSUER: 'https://identity-proxy.test',
  SERVER_ADMIN_IDENTITY_ASSERTION_AUDIENCE: 'server-admin-workspace',
};

const UNSET_CONFIG_VARIABLES = {
  SERVER_ADMIN_WORKSPACE_ID: undefined,
  SERVER_ADMIN_IDENTITY_ASSERTION_HEADER: undefined,
  SERVER_ADMIN_IDENTITY_ASSERTION_JWKS_URL: undefined,
  SERVER_ADMIN_IDENTITY_ASSERTION_ISSUER: undefined,
  SERVER_ADMIN_IDENTITY_ASSERTION_AUDIENCE: undefined,
};

describe('getMissingServerAdminIdentityAssertionVariables', () => {
  it('should report nothing when no variable is set', () => {
    expect(
      getMissingServerAdminIdentityAssertionVariables(UNSET_CONFIG_VARIABLES),
    ).toEqual([]);
  });

  it('should report nothing when only the workspace id is set', () => {
    expect(
      getMissingServerAdminIdentityAssertionVariables({
        ...UNSET_CONFIG_VARIABLES,
        SERVER_ADMIN_WORKSPACE_ID:
          COMPLETE_CONFIG_VARIABLES.SERVER_ADMIN_WORKSPACE_ID,
      }),
    ).toEqual([]);
  });

  it('should report nothing when every variable is set', () => {
    expect(
      getMissingServerAdminIdentityAssertionVariables(
        COMPLETE_CONFIG_VARIABLES,
      ),
    ).toEqual([]);
  });

  it('should report the workspace id when only the assertion variables are set', () => {
    expect(
      getMissingServerAdminIdentityAssertionVariables({
        ...COMPLETE_CONFIG_VARIABLES,
        SERVER_ADMIN_WORKSPACE_ID: undefined,
      }),
    ).toEqual(['SERVER_ADMIN_WORKSPACE_ID']);
  });

  it('should report every assertion variable that is not set', () => {
    expect(
      getMissingServerAdminIdentityAssertionVariables({
        ...UNSET_CONFIG_VARIABLES,
        SERVER_ADMIN_WORKSPACE_ID:
          COMPLETE_CONFIG_VARIABLES.SERVER_ADMIN_WORKSPACE_ID,
        SERVER_ADMIN_IDENTITY_ASSERTION_HEADER:
          COMPLETE_CONFIG_VARIABLES.SERVER_ADMIN_IDENTITY_ASSERTION_HEADER,
      }),
    ).toEqual([
      'SERVER_ADMIN_IDENTITY_ASSERTION_JWKS_URL',
      'SERVER_ADMIN_IDENTITY_ASSERTION_ISSUER',
      'SERVER_ADMIN_IDENTITY_ASSERTION_AUDIENCE',
    ]);
  });
});
