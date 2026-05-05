import { NotFoundException } from '@nestjs/common';

import { SsoProxyLoginController } from 'src/engine/core-modules/auth/controllers/sso-proxy-login.controller';

type ConfigKey =
  | 'AUTH_TYPE'
  | 'DEFAULT_EMAIL_DOMAIN'
  | 'ACCESS_TOKEN_EXPIRES_IN'
  | 'REFRESH_TOKEN_EXPIRES_IN'
  | 'SERVER_URL';

type Headers = string | string[] | undefined;

const buildController = (
  configOverrides?: Partial<Record<ConfigKey, unknown>>,
) => {
  const config: Record<ConfigKey, unknown> = {
    AUTH_TYPE: 'SSO',
    DEFAULT_EMAIL_DOMAIN: 'askii.ai',
    ACCESS_TOKEN_EXPIRES_IN: '30m',
    REFRESH_TOKEN_EXPIRES_IN: '60d',
    SERVER_URL: 'https://twenty.example.com',
    ...configOverrides,
  };

  const twentyConfigService = {
    get: jest.fn((key: ConfigKey) => config[key]),
  };
  const ssoUserProvisioningService = {
    findOrProvision: jest.fn().mockResolvedValue({
      user: { id: 'user-1', email: 'user@askii.ai' },
      workspace: { id: 'workspace-1', subdomain: 'askii' },
    }),
  };
  const accessTokenService = {
    generateAccessToken: jest.fn().mockResolvedValue({
      token: 'access-jwt',
      expiresAt: new Date('2026-04-29T00:00:00Z'),
    }),
  };
  const refreshTokenService = {
    generateRefreshToken: jest.fn().mockResolvedValue({
      token: 'refresh-jwt',
      expiresAt: new Date('2026-06-29T00:00:00Z'),
    }),
  };

  const controller = new SsoProxyLoginController(
    twentyConfigService as any,
    ssoUserProvisioningService as any,
    accessTokenService as any,
    refreshTokenService as any,
  );

  const res: any = {
    cookie: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const proxyLogin = (
    headerEmail: Headers = undefined,
    headerUser: Headers = undefined,
  ) => controller.proxyLogin(headerEmail, headerUser, res);

  return {
    controller,
    twentyConfigService,
    ssoUserProvisioningService,
    accessTokenService,
    refreshTokenService,
    res,
    proxyLogin,
  };
};

describe('SsoProxyLoginController', () => {
  it('should 404 when AUTH_TYPE is not "SSO"', async () => {
    const { proxyLogin } = buildController({ AUTH_TYPE: '' });

    await expect(proxyLogin()).rejects.toThrow(NotFoundException);
  });

  it('should 404 when AUTH_TYPE is some other non-SSO value', async () => {
    const { proxyLogin } = buildController({ AUTH_TYPE: 'PASSWORD' });

    await expect(proxyLogin()).rejects.toThrow(NotFoundException);
  });

  it('should 404 (opaque) when both identity headers are missing', async () => {
    const { proxyLogin } = buildController();

    await expect(proxyLogin()).rejects.toThrow(NotFoundException);
  });

  it('should 404 when X-Auth-Request-Email is an empty-string array', async () => {
    const { proxyLogin } = buildController();

    await expect(proxyLogin([''], undefined)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should provision user from X-Auth-Request-Email and redirect', async () => {
    const { ssoUserProvisioningService, res, proxyLogin } = buildController();

    await proxyLogin('someone@askii.ai');

    expect(ssoUserProvisioningService.findOrProvision).toHaveBeenCalledWith(
      'someone@askii.ai',
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'tokenPair',
      expect.stringContaining('access-jwt'),
      expect.objectContaining({
        path: '/',
        sameSite: 'lax',
        secure: true,
        httpOnly: false,
      }),
    );
    expect(res.redirect).toHaveBeenCalledWith(302, '/');
  });

  it('should synthesize email when X-Auth-Request-User has no @-sign', async () => {
    const { ssoUserProvisioningService, proxyLogin } = buildController();

    await proxyLogin(undefined, 'BARE_USERNAME');

    expect(ssoUserProvisioningService.findOrProvision).toHaveBeenCalledWith(
      'bare_username@askii.ai',
    );
  });

  it('should prefer X-Auth-Request-Email over X-Auth-Request-User when both present', async () => {
    const { ssoUserProvisioningService, proxyLogin } = buildController();

    await proxyLogin('real@askii.ai', 'fallback');

    expect(ssoUserProvisioningService.findOrProvision).toHaveBeenCalledWith(
      'real@askii.ai',
    );
  });

  it('should use the first value when X-Auth-Request-Email is array-valued', async () => {
    const { ssoUserProvisioningService, proxyLogin } = buildController();

    await proxyLogin(['first@askii.ai', 'second@askii.ai']);

    expect(ssoUserProvisioningService.findOrProvision).toHaveBeenCalledWith(
      'first@askii.ai',
    );
  });

  it('should set tokenPair cookie maxAge from REFRESH_TOKEN_EXPIRES_IN, not the access token', async () => {
    const { res, proxyLogin } = buildController({
      ACCESS_TOKEN_EXPIRES_IN: '15m',
      REFRESH_TOKEN_EXPIRES_IN: '7d',
    });

    await proxyLogin('someone@askii.ai');

    expect(res.cookie).toHaveBeenCalledWith(
      'tokenPair',
      expect.any(String),
      expect.objectContaining({ maxAge: 7 * 24 * 60 * 60 * 1000 }),
    );
  });

  it('should set Secure cookie flag based on SERVER_URL scheme', async () => {
    const { res: httpsRes, proxyLogin: httpsProxyLogin } = buildController({
      SERVER_URL: 'https://twenty.example.com',
    });

    await httpsProxyLogin('someone@askii.ai');

    expect(httpsRes.cookie).toHaveBeenCalledWith(
      'tokenPair',
      expect.any(String),
      expect.objectContaining({ secure: true }),
    );

    const { res: httpRes, proxyLogin: httpProxyLogin } = buildController({
      SERVER_URL: 'http://localhost:3000',
    });

    await httpProxyLogin('someone@askii.ai');

    expect(httpRes.cookie).toHaveBeenCalledWith(
      'tokenPair',
      expect.any(String),
      expect.objectContaining({ secure: false }),
    );
  });

  it('should 404 when bare username arrives without DEFAULT_EMAIL_DOMAIN configured', async () => {
    const { proxyLogin } = buildController({ DEFAULT_EMAIL_DOMAIN: '' });

    await expect(proxyLogin(undefined, 'lone_username')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should pass authProvider=SSO when issuing tokens', async () => {
    const { accessTokenService, refreshTokenService, proxyLogin } =
      buildController();

    await proxyLogin('someone@askii.ai');

    expect(accessTokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        workspaceId: 'workspace-1',
        authProvider: 'sso',
      }),
    );
    expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        workspaceId: 'workspace-1',
        authProvider: 'sso',
      }),
    );
  });
});
