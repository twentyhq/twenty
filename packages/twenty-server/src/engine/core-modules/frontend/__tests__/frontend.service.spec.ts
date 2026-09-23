import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { Controller, Get, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { FrontendModule } from 'src/engine/core-modules/frontend/frontend.module';
import request from 'supertest';

import { type ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { type WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FrontendService } from 'src/engine/core-modules/frontend/frontend.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';

jest.mock(
  'src/engine/core-modules/client-config/services/client-config.service',
  () => ({ ClientConfigService: class {} }),
);
jest.mock(
  'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service',
  () => ({ WorkspaceDomainsService: class {} }),
);

jest.mock('src/engine/core-modules/client-config/client-config.module', () => ({
  ClientConfigModule: class {},
}));
jest.mock(
  'src/engine/core-modules/domain/workspace-domains/workspace-domains.module',
  () => ({ WorkspaceDomainsModule: class {} }),
);

@Controller('healthz')
class HealthController {
  // This unauthenticated test controller verifies API routing precedence.
  // oxlint-disable-next-line twenty/rest-api-methods-should-be-guarded
  @Get()
  health() {
    return { status: 'ok' };
  }
}

describe('frontend HTML delivery', () => {
  const config = {
    isMultiWorkspaceEnabled: true,
    frontDomain: 'twenty.test',
    authProviders: { password: true },
  };
  const getClientConfig = jest.fn();
  const resolveWorkspaceAndPublicDomain = jest.fn();
  let directory: string;
  let app: INestApplication;

  beforeEach(async () => {
    jest.useRealTimers();
    getClientConfig.mockReset().mockResolvedValue(config);
    resolveWorkspaceAndPublicDomain
      .mockReset()
      .mockImplementation(async (origin: string) => ({
        workspace: {
          allowedIframeOrigins:
            origin === 'https://customer.twenty.test'
              ? ['https://portal.customer.com']
              : [],
        },
        isIsolatedOrigin: false,
      }));
    directory = mkdtempSync(join(tmpdir(), 'twenty-frontend-'));
    writeFileSync(
      join(directory, 'index.html'),
      '<html><head><!-- BEGIN: Twenty Config --><script>window._env_={REACT_APP_SERVER_BASE_URL:"wrong"}</script><!-- END: Twenty Config --></head><body><div id="root"></div></body></html>',
    );
    const service = new FrontendService(
      { getClientConfig } as unknown as ClientConfigService,
      { resolveWorkspaceAndPublicDomain } as unknown as WorkspaceDomainsService,
      directory,
    );
    const module = await Test.createTestingModule({
      imports: [FrontendModule],
      controllers: [HealthController],
    })
      .overrideProvider(FrontendService)
      .useValue(service)
      .compile();

    app = module.createNestApplication();
    app.getHttpAdapter().getInstance().set('trust proxy', 'loopback');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it.each(['/', '/index.html', '/objects/people'])(
    'bootstraps configuration and applies the hostname policy on %s',
    async (pathname) => {
      const response = await request(app.getHttpServer())
        .get(pathname)
        .set('Host', 'customer.twenty.test')
        .set('X-Forwarded-Proto', 'https')
        .expect(200);
      expect(response.headers['content-security-policy']).toContain(
        "frame-ancestors 'self' https://portal.customer.com;",
      );
      expect(response.headers['x-frame-options']).toBeUndefined();
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.headers['cdn-cache-control']).toBe('no-store');
      expect(response.text).toContain(
        `type="application/json">${JSON.stringify(config)}</script>`,
      );
      expect(response.text).toContain('window._env_ = {};');
      expect(response.text).not.toContain('wrong');
    },
  );

  it('does not borrow a policy from another workspace or a supplied Origin header', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .set('Host', 'other.twenty.test')
      .set('Origin', 'https://customer.twenty.test')
      .expect(200);
    expect(response.headers['content-security-policy']).toBe(
      "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
    );
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('reads fresh policy and configuration on subsequent documents, even with a conditional request', async () => {
    await request(app.getHttpServer())
      .get('/')
      .set('Host', 'customer.twenty.test')
      .set('X-Forwarded-Proto', 'https');
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: { allowedIframeOrigins: [] },
      isIsolatedOrigin: false,
    });
    const response = await request(app.getHttpServer())
      .get('/')
      .set('Host', 'customer.twenty.test')
      .set('If-None-Match', '*')
      .expect(200);
    expect(response.headers['content-security-policy']).not.toContain(
      'portal.customer.com',
    );
    expect(getClientConfig).toHaveBeenCalledTimes(2);
  });

  it('escapes script terminators and preserves literal replacement tokens in configuration', async () => {
    getClientConfig.mockResolvedValue({
      ...config,
      frontDomain: "</script><script>alert(1)</script>$&$'",
    });
    const response = await request(app.getHttpServer()).get('/').expect(200);
    expect(response.text).not.toContain('<script>alert(1)');
    const serializedConfig = response.text.match(
      /type="application\/json">(.*?)<\/script>/,
    )?.[1];
    expect(JSON.parse(serializedConfig!)).toEqual(await getClientConfig());
  });

  it('serves signup on an installation with no workspace', async () => {
    resolveWorkspaceAndPublicDomain.mockRejectedValue(
      WorkspaceNotFoundDefaultError,
    );
    await request(app.getHttpServer()).get('/').expect(200);
  });

  it('fails closed when policy resolution fails', async () => {
    resolveWorkspaceAndPublicDomain.mockRejectedValue(
      new Error('Database unavailable'),
    );
    const response = await request(app.getHttpServer()).get('/').expect(503);
    expect(response.headers['content-security-policy']).toContain(
      "frame-ancestors 'self'",
    );
  });

  it('does not serve the CRM on a public application domain', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: undefined,
      isIsolatedOrigin: true,
    });
    await request(app.getHttpServer()).get('/').expect(404);
  });

  it.each([
    '/graphql/missing',
    '/rest/missing',
    '/auth/missing',
    '/assets/missing.js',
    '/assets/missing',
    '/.well-known/missing',
  ])('does not turn %s into a successful HTML response', async (pathname) => {
    await request(app.getHttpServer()).get(pathname).expect(404);
    expect(getClientConfig).not.toHaveBeenCalled();
  });

  it('preserves API controller routing', async () => {
    const response = await request(app.getHttpServer())
      .get('/healthz')
      .expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(getClientConfig).not.toHaveBeenCalled();
  });

  it('serves static assets and blocks framing of alternate HTML paths', async () => {
    writeFileSync(join(directory, 'example.js'), 'console.log(1);');
    const asset = await request(app.getHttpServer())
      .get('/example.js')
      .expect(200);
    expect(asset.text).toBe('console.log(1);');
    const html = await request(app.getHttpServer())
      .get('/%69ndex.html')
      .expect(200);
    expect(html.headers['content-security-policy']).toBe(
      "frame-ancestors 'none'",
    );
    expect(html.headers['cache-control']).toBe('no-store');
    expect(getClientConfig).not.toHaveBeenCalled();
  });

  it('does not serve HTML for POST requests', async () => {
    await request(app.getHttpServer()).post('/objects/people').expect(404);
  });

  it('returns the policy for HEAD requests without a response body', async () => {
    const response = await request(app.getHttpServer()).head('/').expect(200);
    expect(response.headers['content-security-policy']).toContain(
      "frame-ancestors 'self'",
    );
    expect(response.text).toBeUndefined();
  });
});
