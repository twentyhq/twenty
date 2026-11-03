import { type Request } from 'express';

import { ServerAdminAccessService } from 'src/engine/core-modules/server-admin-access/services/server-admin-access.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const buildService = (config: Record<string, string | undefined>) =>
  new ServerAdminAccessService({
    get: (key: string) => config[key],
  } as unknown as TwentyConfigService);

const buildRequest = (host: string | undefined) =>
  ({
    get: (header: string) => (header === 'host' ? host : undefined),
  }) as unknown as Request;

describe('ServerAdminAccessService', () => {
  it('allows any host when no admin console is configured, as for a default self-hosted server', () => {
    const service = buildService({});

    expect(service.isRequestAllowed(buildRequest('crm.example.com'))).toBe(
      true,
    );
  });

  it('only allows the admin console host once one is configured', () => {
    const service = buildService({
      ADMIN_CONSOLE_URL: 'https://admin.example.com',
    });

    expect(service.isRequestAllowed(buildRequest('acme.example.com'))).toBe(
      false,
    );
    expect(service.isRequestAllowed(buildRequest(undefined))).toBe(false);
    expect(service.isRequestAllowed(buildRequest('admin.example.com'))).toBe(
      true,
    );
  });

  it('compares the host case-insensitively and includes the port', () => {
    const service = buildService({
      ADMIN_CONSOLE_URL: 'http://admin.localhost:4100',
    });

    expect(service.isRequestAllowed(buildRequest('ADMIN.localhost:4100'))).toBe(
      true,
    );
    expect(service.isRequestAllowed(buildRequest('admin.localhost'))).toBe(
      false,
    );
  });
});
