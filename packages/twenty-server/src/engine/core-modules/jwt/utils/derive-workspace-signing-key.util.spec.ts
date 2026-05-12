import { generateKeyPairSync } from 'crypto';

import * as jwt from 'jsonwebtoken';

import {
  type AccessTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import {
  deriveTenantKeyPair,
  extractDerivationScope,
} from 'src/engine/core-modules/jwt/utils/derive-workspace-signing-key.util';

const generateMasterPrivateKeyPem = (): string => {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });

  return privateKey.export({ format: 'pem', type: 'pkcs8' }).toString();
};

const buildAccessTokenPayload = (
  workspaceId: string,
): AccessTokenJwtPayload => ({
  sub: 'user-1',
  type: JwtTokenTypeEnum.ACCESS,
  userId: 'user-1',
  workspaceId,
  userWorkspaceId: 'uw-1',
  authProvider: AuthProviderEnum.PASSWORD,
});

describe('deriveTenantKeyPair', () => {
  it('derives the same key pair for the same (master, scope)', () => {
    const masterPrivateKeyPem = generateMasterPrivateKeyPem();
    const scope = { kind: 'workspace', workspaceId: 'ws-1' } as const;

    const first = deriveTenantKeyPair(masterPrivateKeyPem, scope);
    const second = deriveTenantKeyPair(masterPrivateKeyPem, scope);

    expect(first.privateKeyPem).toBe(second.privateKeyPem);
    expect(first.publicKeyPem).toBe(second.publicKeyPem);
  });

  it('derives a different key pair when the workspace changes', () => {
    const masterPrivateKeyPem = generateMasterPrivateKeyPem();
    const ws1 = deriveTenantKeyPair(masterPrivateKeyPem, {
      kind: 'workspace',
      workspaceId: 'ws-1',
    });
    const ws2 = deriveTenantKeyPair(masterPrivateKeyPem, {
      kind: 'workspace',
      workspaceId: 'ws-2',
    });

    expect(ws1.privateKeyPem).not.toBe(ws2.privateKeyPem);
    expect(ws1.publicKeyPem).not.toBe(ws2.publicKeyPem);
  });

  it('namespaces workspace and user scopes so they cannot collide', () => {
    const masterPrivateKeyPem = generateMasterPrivateKeyPem();
    const sharedId = '00000000-0000-0000-0000-000000000001';

    const workspaceScoped = deriveTenantKeyPair(masterPrivateKeyPem, {
      kind: 'workspace',
      workspaceId: sharedId,
    });
    const userScoped = deriveTenantKeyPair(masterPrivateKeyPem, {
      kind: 'user',
      userId: sharedId,
    });

    expect(workspaceScoped.privateKeyPem).not.toBe(userScoped.privateKeyPem);
  });

  it('rejects cross-workspace token forgery', () => {
    const masterPrivateKeyPem = generateMasterPrivateKeyPem();
    const w1 = deriveTenantKeyPair(masterPrivateKeyPem, {
      kind: 'workspace',
      workspaceId: 'ws-1',
    });
    const w2 = deriveTenantKeyPair(masterPrivateKeyPem, {
      kind: 'workspace',
      workspaceId: 'ws-2',
    });

    const token = jwt.sign(buildAccessTokenPayload('ws-1'), w1.privateKeyPem, {
      algorithm: 'ES256',
      expiresIn: '5m',
    });

    expect(() =>
      jwt.verify(token, w1.publicKeyPem, { algorithms: ['ES256'] }),
    ).not.toThrow();

    expect(() =>
      jwt.verify(token, w2.publicKeyPem, { algorithms: ['ES256'] }),
    ).toThrow(jwt.JsonWebTokenError);
  });

  it('rejects tokens whose payload workspaceId was tampered with', () => {
    const masterPrivateKeyPem = generateMasterPrivateKeyPem();
    const w1 = deriveTenantKeyPair(masterPrivateKeyPem, {
      kind: 'workspace',
      workspaceId: 'ws-1',
    });

    // Sign legitimately for ws-1, then re-derive the (different) key for the
    // workspaceId an attacker pretends the token is for. Verification with
    // the re-derived w2 public key MUST fail.
    const tokenForWs1 = jwt.sign(
      buildAccessTokenPayload('ws-1'),
      w1.privateKeyPem,
      { algorithm: 'ES256', expiresIn: '5m' },
    );

    const reDerivedForWs2 = deriveTenantKeyPair(masterPrivateKeyPem, {
      kind: 'workspace',
      workspaceId: 'ws-2',
    });

    expect(() =>
      jwt.verify(tokenForWs1, reDerivedForWs2.publicKeyPem, {
        algorithms: ['ES256'],
      }),
    ).toThrow(jwt.JsonWebTokenError);
  });
});

describe('extractDerivationScope', () => {
  it('returns the workspaceId for workspace-bound tokens', () => {
    const scope = extractDerivationScope(buildAccessTokenPayload('ws-1'));

    expect(scope).toEqual({ kind: 'workspace', workspaceId: 'ws-1' });
  });

  it('returns the userId for WORKSPACE_AGNOSTIC tokens', () => {
    const scope = extractDerivationScope({
      sub: 'user-1',
      type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
      userId: 'user-1',
    });

    expect(scope).toEqual({ kind: 'user', userId: 'user-1' });
  });
});
