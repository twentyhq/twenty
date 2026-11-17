import { validate } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigVariableException } from 'src/engine/core-modules/twenty-config/twenty-config.exception';

const REQUIRED_VARIABLES = {
  PG_DATABASE_URL: 'postgres://postgres:postgres@localhost:5432/default',
  APP_SECRET: 'secret',
  SERVER_URL: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:3001',
};

const SERVER_ADMIN_IDENTITY_ASSERTION_VARIABLES = {
  SERVER_ADMIN_WORKSPACE_ID: '20202020-1c25-4d02-bf25-6aeccf7ea419',
  SERVER_ADMIN_IDENTITY_ASSERTION_HEADER: 'Cf-Access-Jwt-Assertion',
  SERVER_ADMIN_IDENTITY_ASSERTION_JWKS_URL: 'https://identity-proxy.test/keys',
  SERVER_ADMIN_IDENTITY_ASSERTION_ISSUER: 'https://identity-proxy.test',
  SERVER_ADMIN_IDENTITY_ASSERTION_AUDIENCE: 'server-admin-workspace',
};

describe('validate', () => {
  describe('server admin identity assertion', () => {
    it('should accept a configuration without it', () => {
      expect(() => validate(REQUIRED_VARIABLES)).not.toThrow();
    });

    it('should accept the workspace id alone', () => {
      expect(() =>
        validate({
          ...REQUIRED_VARIABLES,
          SERVER_ADMIN_WORKSPACE_ID:
            SERVER_ADMIN_IDENTITY_ASSERTION_VARIABLES.SERVER_ADMIN_WORKSPACE_ID,
        }),
      ).not.toThrow();
    });

    it('should accept a complete configuration', () => {
      expect(() =>
        validate({
          ...REQUIRED_VARIABLES,
          ...SERVER_ADMIN_IDENTITY_ASSERTION_VARIABLES,
        }),
      ).not.toThrow();
    });

    it.each(Object.keys(SERVER_ADMIN_IDENTITY_ASSERTION_VARIABLES))(
      'should refuse a configuration missing %s',
      (missingVariable) => {
        const incompleteVariables = Object.fromEntries(
          Object.entries(SERVER_ADMIN_IDENTITY_ASSERTION_VARIABLES).filter(
            ([variable]) => variable !== missingVariable,
          ),
        );

        expect(() =>
          validate({ ...REQUIRED_VARIABLES, ...incompleteVariables }),
        ).toThrow(ConfigVariableException);
      },
    );
  });
});
