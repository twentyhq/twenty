import { type Request } from 'express';

import { ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { verifyCloudflareAccessAssertion } from 'src/engine/core-modules/server-admin-access/utils/verify-cloudflare-access-assertion.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock(
  'src/engine/core-modules/server-admin-access/utils/verify-cloudflare-access-assertion.util',
);

const mockedVerifyCloudflareAccessAssertion = jest.mocked(
  verifyCloudflareAccessAssertion,
);

const buildService = (config: Record<string, string | undefined>) =>
  new ServerAdminAccessService({
    get: (key: string) => config[key],
  } as unknown as TwentyConfigService);

const buildRequest = (host: string) =>
  ({
    headers: { 'cf-access-jwt-assertion': 'assertion' },
    get: (header: string) => (header === 'host' ? host : undefined),
  }) as unknown as Request;

const ACCESS_CONFIG = {
  SERVER_ADMIN_CLOUDFLARE_ACCESS_TEAM_DOMAIN:
    'https://acme.cloudflareaccess.com',
  SERVER_ADMIN_CLOUDFLARE_ACCESS_AUDIENCE: 'audience',
};

describe('ServerAdminAccessService', () => {
  beforeEach(() => {
    mockedVerifyCloudflareAccessAssertion.mockReset();
  });

  it('allows any host when nothing is configured, as for a default self-hosted server', async () => {
    const service = buildService({});

    await expect(
      service.isRequestAllowed({ request: buildRequest('crm.example.com') }),
    ).resolves.toBe(true);
    expect(mockedVerifyCloudflareAccessAssertion).not.toHaveBeenCalled();
  });

  it('refuses requests outside the admin console host', async () => {
    const service = buildService({
      ADMIN_CONSOLE_URL: 'https://admin.example.com',
    });

    await expect(
      service.isRequestAllowed({ request: buildRequest('acme.example.com') }),
    ).resolves.toBe(false);
    await expect(
      service.isRequestAllowed({ request: buildRequest('admin.example.com') }),
    ).resolves.toBe(true);
  });

  it('refuses requests without a valid Access assertion', async () => {
    const service = buildService(ACCESS_CONFIG);

    mockedVerifyCloudflareAccessAssertion.mockResolvedValue(undefined);

    await expect(
      service.isRequestAllowed({ request: buildRequest('admin.example.com') }),
    ).resolves.toBe(false);
  });

  it.each([
    {
      SERVER_ADMIN_CLOUDFLARE_ACCESS_TEAM_DOMAIN:
        'https://acme.cloudflareaccess.com',
    },
    { SERVER_ADMIN_CLOUDFLARE_ACCESS_AUDIENCE: 'audience' },
    {
      SERVER_ADMIN_CLOUDFLARE_ACCESS_TEAM_DOMAIN:
        'https://acme.cloudflareaccess.com',
      SERVER_ADMIN_CLOUDFLARE_ACCESS_AUDIENCE: '',
    },
  ])(
    'refuses every request when Access is half configured: %o',
    async (config) => {
      const service = buildService(config);

      mockedVerifyCloudflareAccessAssertion.mockResolvedValue(
        'admin@example.com',
      );

      await expect(
        service.isRequestAllowed({
          request: buildRequest('admin.example.com'),
          userEmail: 'admin@example.com',
        }),
      ).resolves.toBe(false);
    },
  );

  it('binds the Access identity to the authenticated user', async () => {
    const service = buildService(ACCESS_CONFIG);

    mockedVerifyCloudflareAccessAssertion.mockResolvedValue(
      'admin@example.com',
    );

    await expect(
      service.isRequestAllowed({
        request: buildRequest('admin.example.com'),
        userEmail: 'Admin@Example.com',
      }),
    ).resolves.toBe(true);
    await expect(
      service.isRequestAllowed({
        request: buildRequest('admin.example.com'),
        userEmail: 'someone-else@example.com',
      }),
    ).resolves.toBe(false);
  });

  it('verifies the assertion once per request', async () => {
    const service = buildService(ACCESS_CONFIG);
    const request = buildRequest('admin.example.com');

    mockedVerifyCloudflareAccessAssertion.mockResolvedValue(
      'admin@example.com',
    );

    await service.isRequestAllowed({ request });
    await service.isRequestAllowed({ request, userEmail: 'admin@example.com' });

    expect(mockedVerifyCloudflareAccessAssertion).toHaveBeenCalledTimes(1);
  });
});
