import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAllowedCredentialedOrigins } from 'src/engine/core-modules/user-session/utils/resolve-allowed-credentialed-origins.util';

const buildTwentyConfigService = (config: Record<string, string>) =>
  ({
    get: (key: string) => config[key],
  }) as unknown as TwentyConfigService;

describe('resolveAllowedCredentialedOrigins', () => {
  it('should allow the server, frontend and explicit origins', () => {
    const allowedOrigins = resolveAllowedCredentialedOrigins(
      buildTwentyConfigService({
        SERVER_URL: 'https://api.twenty.com/graphql',
        FRONTEND_URL: 'https://App.twenty.com',
        AUTH_COOKIE_ALLOWED_ORIGINS: ' https://other.example , file:///tmp',
        NODE_ENV: NodeEnvironment.PRODUCTION,
      }),
    );

    expect([...allowedOrigins]).toEqual([
      'https://api.twenty.com',
      'https://app.twenty.com',
      'https://other.example',
    ]);
  });

  it('should skip derived loopback origins in production only', () => {
    const config = {
      SERVER_URL: 'http://localhost:3000',
      FRONTEND_URL: 'http://localhost:3001',
      AUTH_COOKIE_ALLOWED_ORIGINS: 'http://localhost:3001',
      NODE_ENV: NodeEnvironment.PRODUCTION,
    };

    expect([
      ...resolveAllowedCredentialedOrigins(buildTwentyConfigService(config)),
    ]).toEqual(['http://localhost:3001']);

    expect([
      ...resolveAllowedCredentialedOrigins(
        buildTwentyConfigService({
          ...config,
          NODE_ENV: NodeEnvironment.DEVELOPMENT,
        }),
      ),
    ]).toEqual(['http://localhost:3000', 'http://localhost:3001']);
  });

  it('should reflect config changes made after a previous call', () => {
    const config = {
      SERVER_URL: 'https://api.twenty.com',
      FRONTEND_URL: 'https://app.twenty.com',
      AUTH_COOKIE_ALLOWED_ORIGINS: '',
      NODE_ENV: NodeEnvironment.PRODUCTION,
    };
    const twentyConfigService = buildTwentyConfigService(config);

    expect(
      resolveAllowedCredentialedOrigins(twentyConfigService).has(
        'https://other.example',
      ),
    ).toBe(false);

    config.AUTH_COOKIE_ALLOWED_ORIGINS = 'https://other.example';

    expect(
      resolveAllowedCredentialedOrigins(twentyConfigService).has(
        'https://other.example',
      ),
    ).toBe(true);
  });
});
