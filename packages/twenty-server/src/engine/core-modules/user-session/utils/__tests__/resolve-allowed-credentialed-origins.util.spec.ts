import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAllowedCredentialedOrigins } from 'src/engine/core-modules/user-session/utils/resolve-allowed-credentialed-origins.util';

type CredentialedOriginsConfig = Pick<
  ConfigVariables,
  'SERVER_URL' | 'FRONTEND_URL' | 'AUTH_COOKIE_ALLOWED_ORIGINS' | 'NODE_ENV'
>;

const PRODUCTION_CONFIG: CredentialedOriginsConfig = {
  SERVER_URL: 'https://api.twenty.com',
  FRONTEND_URL: 'https://app.twenty.com',
  AUTH_COOKIE_ALLOWED_ORIGINS: '',
  NODE_ENV: NodeEnvironment.PRODUCTION,
};

const buildTwentyConfigService = (
  config: CredentialedOriginsConfig,
): Pick<TwentyConfigService, 'get'> => {
  const configVariables = Object.assign(new ConfigVariables(), config);

  return {
    get: (key) => configVariables[key],
  };
};

describe('resolveAllowedCredentialedOrigins', () => {
  it('should allow the server, frontend and explicit origins', () => {
    const allowedOrigins = resolveAllowedCredentialedOrigins(
      buildTwentyConfigService({
        ...PRODUCTION_CONFIG,
        SERVER_URL: 'https://api.twenty.com/graphql',
        FRONTEND_URL: 'https://App.twenty.com',
        AUTH_COOKIE_ALLOWED_ORIGINS: ' https://other.example , file:///tmp',
      }),
    );

    expect([...allowedOrigins]).toEqual([
      'https://api.twenty.com',
      'https://app.twenty.com',
      'https://other.example',
    ]);
  });

  it('should skip derived loopback origins in production only', () => {
    const loopbackConfig: CredentialedOriginsConfig = {
      SERVER_URL: 'http://localhost:3000',
      FRONTEND_URL: 'http://localhost:3001',
      AUTH_COOKIE_ALLOWED_ORIGINS: 'http://localhost:3001',
      NODE_ENV: NodeEnvironment.PRODUCTION,
    };

    const productionAllowedOrigins = resolveAllowedCredentialedOrigins(
      buildTwentyConfigService(loopbackConfig),
    );
    const developmentAllowedOrigins = resolveAllowedCredentialedOrigins(
      buildTwentyConfigService({
        ...loopbackConfig,
        NODE_ENV: NodeEnvironment.DEVELOPMENT,
      }),
    );

    expect([...productionAllowedOrigins]).toEqual(['http://localhost:3001']);
    expect([...developmentAllowedOrigins]).toEqual([
      'http://localhost:3000',
      'http://localhost:3001',
    ]);
  });

  it('should reuse the resolved origins while the config is unchanged', () => {
    const twentyConfigService = buildTwentyConfigService(PRODUCTION_CONFIG);

    expect(resolveAllowedCredentialedOrigins(twentyConfigService)).toBe(
      resolveAllowedCredentialedOrigins(twentyConfigService),
    );
  });

  it('should resolve the origins again when the config changes', () => {
    const allowedOriginsBeforeChange = resolveAllowedCredentialedOrigins(
      buildTwentyConfigService(PRODUCTION_CONFIG),
    );
    const allowedOriginsAfterChange = resolveAllowedCredentialedOrigins(
      buildTwentyConfigService({
        ...PRODUCTION_CONFIG,
        AUTH_COOKIE_ALLOWED_ORIGINS: 'https://other.example',
      }),
    );

    expect(allowedOriginsAfterChange).not.toBe(allowedOriginsBeforeChange);
    expect(allowedOriginsBeforeChange.has('https://other.example')).toBe(false);
    expect(allowedOriginsAfterChange.has('https://other.example')).toBe(true);
  });
});
