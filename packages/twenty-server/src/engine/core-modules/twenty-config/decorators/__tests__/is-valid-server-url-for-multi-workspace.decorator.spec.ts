import { validateSync } from 'class-validator';

import { IsValidServerUrlForMultiWorkspace } from 'src/engine/core-modules/twenty-config/decorators/is-valid-server-url-for-multi-workspace.decorator';

describe('IsValidServerUrlForMultiWorkspace', () => {
  class ConfigVariables {
    IS_MULTIWORKSPACE_ENABLED?: boolean | string;

    FRONTEND_URL?: string;

    @IsValidServerUrlForMultiWorkspace()
    SERVER_URL: string;
  }

  const buildConfig = (
    SERVER_URL: string,
    IS_MULTIWORKSPACE_ENABLED?: boolean | string,
    FRONTEND_URL?: string,
  ) =>
    Object.assign(new ConfigVariables(), {
      SERVER_URL,
      IS_MULTIWORKSPACE_ENABLED,
      FRONTEND_URL,
    });

  it.each([
    'http://192.168.2.20:3353',
    'https://10.0.0.1',
    'http://[::1]:3000',
    'http://[2001:db8::1]',
  ])('should reject IP-based url %s when multi-workspace is enabled', (url) => {
    expect(validateSync(buildConfig(url, true))).toHaveLength(1);
    expect(validateSync(buildConfig(url, 'true'))).toHaveLength(1);
  });

  it.each([
    'http://localhost:3000',
    'https://crm.example.com',
    'https://api.twenty.com',
  ])(
    'should accept domain-based url %s when multi-workspace is enabled',
    (url) => {
      expect(validateSync(buildConfig(url, true))).toHaveLength(0);
    },
  );

  it.each([false, 'false', undefined])(
    'should accept IP-based url when multi-workspace is %s',
    (isMultiWorkspaceEnabled) => {
      expect(
        validateSync(
          buildConfig('http://192.168.2.20:3353', isMultiWorkspaceEnabled),
        ),
      ).toHaveLength(0);
    },
  );

  it('should reject a malformed url when multi-workspace is enabled', () => {
    expect(validateSync(buildConfig('not a url', true))).toHaveLength(1);
  });

  it('should accept an IP-based server url when the frontend url uses a domain', () => {
    expect(
      validateSync(
        buildConfig('http://10.0.0.1:3000', true, 'https://crm.example.com'),
      ),
    ).toHaveLength(0);
  });

  it('should reject an IP-based frontend url even when the server url uses a domain', () => {
    expect(
      validateSync(
        buildConfig(
          'https://api.example.com',
          true,
          'http://192.168.2.20:3001',
        ),
      ),
    ).toHaveLength(1);
  });
});
