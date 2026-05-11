import { JwtService } from '@nestjs/jwt';

import { generateKeyPairSync } from 'crypto';

import * as jwt from 'jsonwebtoken';

import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  computeJwkThumbprint,
  type JwtKeyManagerService,
} from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

const generateEs256KeyPair = () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
  });
  const publicJwk = publicKey.export({ format: 'jwk' });

  return {
    privateKey,
    publicKey,
    kid: computeJwkThumbprint(publicJwk),
  };
};

describe('JwtWrapperService', () => {
  const APP_SECRET = 'test-app-secret';
  const buildConfig = () => ({
    get: jest.fn((key: string) =>
      key === 'APP_SECRET' ? APP_SECRET : undefined,
    ),
  });

  const buildJwtService = (): JwtService =>
    new JwtService({
      verifyOptions: { algorithms: ['HS256', 'ES256'] },
    });

  describe('verifyJwtToken', () => {
    it('routes a token without kid to the legacy HS256 path', async () => {
      const jwtService = buildJwtService();
      const config = buildConfig();
      const keyManager = {
        getCurrentSigningKey: jest.fn(),
        getPublicKeyByKid: jest.fn(),
      } as unknown as JwtKeyManagerService;

      const wrapper = new JwtWrapperService(
        jwtService,
        config as any,
        keyManager,
      );

      const workspaceId = 'ws-1';
      const secret = wrapper.generateAppSecret(
        JwtTokenTypeEnum.ACCESS,
        workspaceId,
      );

      const legacyToken = jwt.sign(
        { workspaceId, type: JwtTokenTypeEnum.ACCESS },
        secret,
        { algorithm: 'HS256', expiresIn: '5m' },
      );

      const verified = await wrapper.verifyJwtToken(legacyToken);

      expect(verified.type).toBe(JwtTokenTypeEnum.ACCESS);
      expect(keyManager.getPublicKeyByKid).not.toHaveBeenCalled();
    });

    it('routes a token with kid to the ES256 path', async () => {
      const jwtService = buildJwtService();
      const config = buildConfig();
      const { privateKey, publicKey, kid } = generateEs256KeyPair();

      const keyManager = {
        getCurrentSigningKey: jest.fn(),
        getPublicKeyByKid: jest.fn(async (askedKid: string) =>
          askedKid === kid ? publicKey : null,
        ),
      } as unknown as JwtKeyManagerService;

      const wrapper = new JwtWrapperService(
        jwtService,
        config as any,
        keyManager,
      );

      const token = jwt.sign(
        { workspaceId: 'ws-1', type: JwtTokenTypeEnum.ACCESS },
        privateKey,
        { algorithm: 'ES256', keyid: kid, expiresIn: '5m' },
      );

      const verified = await wrapper.verifyJwtToken(token);

      expect(verified.type).toBe(JwtTokenTypeEnum.ACCESS);
      expect(keyManager.getPublicKeyByKid).toHaveBeenCalledWith(kid);
    });

    it('throws an UNAUTHENTICATED auth exception when kid is unknown', async () => {
      const jwtService = buildJwtService();
      const config = buildConfig();
      const { privateKey, kid } = generateEs256KeyPair();

      const keyManager = {
        getCurrentSigningKey: jest.fn(),
        getPublicKeyByKid: jest.fn(async () => null),
      } as unknown as JwtKeyManagerService;

      const wrapper = new JwtWrapperService(
        jwtService,
        config as any,
        keyManager,
      );

      const token = jwt.sign(
        { workspaceId: 'ws-1', type: JwtTokenTypeEnum.ACCESS },
        privateKey,
        { algorithm: 'ES256', keyid: kid, expiresIn: '5m' },
      );

      await expect(wrapper.verifyJwtToken(token)).rejects.toMatchObject({
        code: AuthExceptionCode.UNAUTHENTICATED,
      });
    });
  });

  describe('signAsymmetric', () => {
    it('returns null when no signing key is configured', async () => {
      const jwtService = buildJwtService();
      const config = buildConfig();
      const keyManager = {
        getCurrentSigningKey: jest.fn(async () => null),
        getPublicKeyByKid: jest.fn(),
      } as unknown as JwtKeyManagerService;

      const wrapper = new JwtWrapperService(
        jwtService,
        config as any,
        keyManager,
      );

      const result = await wrapper.signAsymmetric({
        workspaceId: 'ws-1',
        type: JwtTokenTypeEnum.ACCESS,
      } as any);

      expect(result).toBeNull();
    });

    it('signs a token with ES256 and a kid header when a signing key is configured', async () => {
      const jwtService = buildJwtService();
      const config = buildConfig();
      const { privateKey, publicKey, kid } = generateEs256KeyPair();

      const keyManager = {
        getCurrentSigningKey: jest.fn(async () => ({
          privateKey,
          publicKey,
          kid,
        })),
        getPublicKeyByKid: jest.fn(),
      } as unknown as JwtKeyManagerService;

      const wrapper = new JwtWrapperService(
        jwtService,
        config as any,
        keyManager,
      );

      const token = await wrapper.signAsymmetric({
        workspaceId: 'ws-1',
        type: JwtTokenTypeEnum.ACCESS,
      } as any);

      expect(token).not.toBeNull();
      const decoded = jwt.decode(token!, { complete: true });

      expect(decoded).not.toBeNull();
      const decodedHeader = (decoded as jwt.Jwt).header;

      expect(decodedHeader.alg).toBe('ES256');
      expect(decodedHeader.kid).toBe(kid);
    });
  });
});
