import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { isOriginAllowedForCredentials } from 'src/engine/core-modules/user-session/utils/is-origin-allowed-for-credentials.util';

const buildConfigService = (
  overrides: Record<string, unknown> = {},
): TwentyConfigService => {
  const config: Record<string, unknown> = {
    SERVER_URL: 'https://api.twenty.example',
    FRONTEND_URL: 'https://twenty.example',
    AUTH_COOKIE_ALLOWED_ORIGINS: '',
    IS_MULTIWORKSPACE_ENABLED: false,
    NODE_ENV: NodeEnvironment.DEVELOPMENT,
    ...overrides,
  };

  return {
    get: (key: string) => config[key],
  } as unknown as TwentyConfigService;
};

const expectAllowed = (
  origin: string,
  overrides: Record<string, unknown> = {},
) =>
  isOriginAllowedForCredentials({
    origin,
    twentyConfigService: buildConfigService(overrides),
  });

describe('isOriginAllowedForCredentials', () => {
  it('should allow the configured front-end and server origins', () => {
    expect(expectAllowed('https://twenty.example')).toBe(true);
    expect(expectAllowed('https://api.twenty.example')).toBe(true);
  });

  it('should allow an explicitly declared origin', () => {
    expect(
      expectAllowed('https://app.other.example', {
        AUTH_COOKIE_ALLOWED_ORIGINS: 'https://app.other.example',
      }),
    ).toBe(true);
  });

  it('should reject an unrelated origin', () => {
    expect(expectAllowed('https://attacker.example')).toBe(false);
  });

  describe('workspace subdomains', () => {
    const multiWorkspace = { IS_MULTIWORKSPACE_ENABLED: true };

    it('should allow any subdomain of the front-end domain', () => {
      expect(expectAllowed('https://acme.twenty.example', multiWorkspace)).toBe(
        true,
      );
      expect(expectAllowed('https://app.twenty.example', multiWorkspace)).toBe(
        true,
      );
    });

    it('should reject subdomains when multi-workspace is disabled', () => {
      expect(expectAllowed('https://acme.twenty.example')).toBe(false);
    });

    it('should reject a host that merely ends with the front-end domain string', () => {
      expect(expectAllowed('https://eviltwenty.example', multiWorkspace)).toBe(
        false,
      );
    });

    it('should reject a subdomain on another scheme or port', () => {
      expect(expectAllowed('http://acme.twenty.example', multiWorkspace)).toBe(
        false,
      );
      expect(
        expectAllowed('https://acme.twenty.example:8443', multiWorkspace),
      ).toBe(false);
    });

    it('should allow a deeper label under the front-end domain', () => {
      expect(
        expectAllowed('https://acme.eu.twenty.example', multiWorkspace),
      ).toBe(true);
    });

    it('should reject a subdomain of the server domain, which no browser is served from', () => {
      expect(
        expectAllowed('https://acme.api.example', {
          ...multiWorkspace,
          SERVER_URL: 'https://api.example',
        }),
      ).toBe(false);
    });
  });

  it('should reject opaque origins', () => {
    expect(expectAllowed('null')).toBe(false);
    expect(expectAllowed('file:///etc/passwd')).toBe(false);
  });
});
