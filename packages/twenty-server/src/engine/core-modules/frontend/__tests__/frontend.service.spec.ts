import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { Controller, Get, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HttpAdapterHost } from '@nestjs/core';

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

  it('initializes CLI application contexts with bundled HTML and no HTTP adapter', async () => {
    const module = await Test.createTestingModule({ imports: [FrontendModule] })
      .overrideProvider(FrontendService)
      .useValue(
        new FrontendService(
          { getClientConfig } as unknown as ClientConfigService,
          {
            resolveWorkspaceAndPublicDomain,
          } as unknown as WorkspaceDomainsService,
          directory,
        ),
      )
      .compile();
    expect(module.get(HttpAdapterHost).httpAdapter).toBeUndefined();
    await expect(module.init()).resolves.toBeDefined();
    await module.close();
  });

  it.each([
    '/',
    '/index.html',
    '/objects/people',
    '/invite/apple.dev-invite-hash',
    '/invite/apple.dev-invite-hash/',
    '/reset-password/header.payload.signature',
    '/reset-password/header.payload.signature/',
  ])(
    'bootstraps configuration and applies the hostname policy on %s',
    async (pathname) => {
      const response = await request(app.getHttpServer())
        .get(pathname)
        .set('Accept', 'text/html')
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
      .set('Accept', 'text/html')
      .set('Host', 'other.twenty.test')
      .set('Origin', 'https://customer.twenty.test')
      .expect(200);
    expect(response.headers['content-security-policy']).toBe(
      "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
    );
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('reads fresh policy and configuration on subsequent documents, even with a conditional request', async () => {
    const initial = await request(app.getHttpServer())
      .get('/')
      .set('Accept', 'text/html')
      .set('Host', 'customer.twenty.test')
      .set('X-Forwarded-Proto', 'https');
    expect(initial.headers['content-security-policy']).toContain(
      'https://portal.customer.com',
    );
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: { allowedIframeOrigins: [] },
      isIsolatedOrigin: false,
    });
    const response = await request(app.getHttpServer())
      .get('/')
      .set('Accept', 'text/html')
      .set('Host', 'customer.twenty.test')
      .set('X-Forwarded-Proto', 'https')
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
    const response = await request(app.getHttpServer())
      .get('/')
      .set('Accept', 'text/html')
      .expect(200);
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
    await request(app.getHttpServer())
      .get('/')
      .set('Accept', 'text/html')
      .expect(200);
  });

  it('fails closed when policy resolution fails', async () => {
    resolveWorkspaceAndPublicDomain.mockRejectedValue(
      new Error('Database unavailable'),
    );
    const response = await request(app.getHttpServer())
      .get('/')
      .set('Accept', 'text/html')
      .expect(503);
    expect(response.headers['content-security-policy']).toContain(
      "frame-ancestors 'self'",
    );
  });

  it('does not serve the CRM on a public application domain', async () => {
    resolveWorkspaceAndPublicDomain.mockResolvedValue({
      workspace: undefined,
      isIsolatedOrigin: true,
    });
    await request(app.getHttpServer())
      .get('/')
      .set('Accept', 'text/html')
      .expect(404);
  });

  it.each([
    '/graphql/missing',
    '/rest/missing',
    '/auth/missing',
    '/assets/missing.js',
    '/invite/apple.dev-invite-hash/missing.js',
    '/reset-password/header.payload.signature/missing.js',
    '/.well-known/missing',
  ])('does not turn %s into a successful HTML response', async (pathname) => {
    await request(app.getHttpServer())
      .get(pathname)
      .set('Accept', 'text/html')
      .expect(404);
    expect(getClientConfig).not.toHaveBeenCalled();
  });

  it.each([
    '*/*',
    'application/json',
    'image/avif,image/webp,*/*',
    'text/html;q=0',
  ])('does not serve a document for Accept: %s', async (accept) => {
    await request(app.getHttpServer())
      .get('/new-asset-directory/missing')
      .set('Accept', accept)
      .expect(404);
    expect(getClientConfig).not.toHaveBeenCalled();
  });

  it.each(['script', 'style', 'image', 'font', 'empty'])(
    'does not serve a document for Sec-Fetch-Dest: %s',
    async (destination) => {
      await request(app.getHttpServer())
        .get('/new-asset-directory/missing')
        .set('Accept', 'text/html')
        .set('Sec-Fetch-Dest', destination)
        .expect(404);
      expect(getClientConfig).not.toHaveBeenCalled();
    },
  );

  it.each(['document', 'iframe', 'frame'])(
    'serves HTML navigation with Sec-Fetch-Dest: %s',
    async (destination) => {
      await request(app.getHttpServer())
        .get('/objects/people')
        .set('Accept', 'text/html,application/xhtml+xml,*/*;q=0.8')
        .set('Sec-Fetch-Dest', destination)
        .expect(200);
      expect(getClientConfig).toHaveBeenCalledTimes(1);
    },
  );

  it('serves extensionless static files in arbitrary directories before the SPA fallback', async () => {
    mkdirSync(join(directory, 'new-asset-directory'));
    writeFileSync(
      join(directory, 'new-asset-directory', 'example'),
      'static content',
    );
    const response = await request(app.getHttpServer())
      .get('/new-asset-directory/example')
      .set('Accept', 'text/html')
      .expect(200);
    expect(response.body.toString()).toBe('static content');
    expect(getClientConfig).not.toHaveBeenCalled();
  });

  it('preserves API controller routing', async () => {
    const response = await request(app.getHttpServer())
      .get('/healthz')
      .set('Accept', 'text/html')
      .expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(getClientConfig).not.toHaveBeenCalled();
  });

  it('serves static assets and blocks framing of alternate HTML paths', async () => {
    writeFileSync(join(directory, 'example.js'), 'console.log(1);');
    const asset = await request(app.getHttpServer())
      .get('/example.js')
      .set('Accept', 'text/html')
      .expect(200);
    expect(asset.text).toBe('console.log(1);');
    const html = await request(app.getHttpServer())
      .get('/%69ndex.html')
      .set('Accept', 'text/html')
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
    const response = await request(app.getHttpServer())
      .head('/')
      .set('Accept', 'text/html')
      .expect(200);
    expect(response.headers['content-security-policy']).toContain(
      "frame-ancestors 'self'",
    );
    expect(response.text).toBeUndefined();
  });
});
