import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  createHash,
  createPrivateKey,
  createPublicKey,
  type JsonWebKey,
  type KeyObject,
} from 'crypto';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { JwtPublicKeyEntity } from 'src/engine/core-modules/jwt/entities/jwt-public-key.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type CurrentSigningKey = {
  privateKey: KeyObject;
  publicKey: KeyObject;
  kid: string;
};

@Injectable()
export class JwtKeyManagerService {
  private readonly logger = new Logger(JwtKeyManagerService.name);

  private currentSigningKeyPromise: Promise<CurrentSigningKey | null> | null =
    null;

  private readonly publicKeyCache = new Map<string, KeyObject>();

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(JwtPublicKeyEntity)
    private readonly jwtPublicKeyRepository: Repository<JwtPublicKeyEntity>,
  ) {}

  async getCurrentSigningKey(): Promise<CurrentSigningKey | null> {
    if (this.currentSigningKeyPromise === null) {
      this.currentSigningKeyPromise = this.loadAndRegisterSigningKey();
    }

    try {
      return await this.currentSigningKeyPromise;
    } catch (error) {
      this.currentSigningKeyPromise = null;
      throw error;
    }
  }

  async getPublicKeyByKid(kid: string): Promise<KeyObject | null> {
    const cached = this.publicKeyCache.get(kid);

    if (isDefined(cached)) {
      return cached;
    }

    const row = await this.jwtPublicKeyRepository.findOne({ where: { kid } });

    if (!isDefined(row)) {
      return null;
    }

    const publicKey = createPublicKey(row.publicKey);

    this.publicKeyCache.set(kid, publicKey);

    return publicKey;
  }

  computeKidFromPublicKey(publicKey: KeyObject): string {
    const jwk = publicKey.export({ format: 'jwk' });

    return computeJwkThumbprint(jwk);
  }

  resetForTests(): void {
    this.currentSigningKeyPromise = null;
    this.publicKeyCache.clear();
  }

  private async loadAndRegisterSigningKey(): Promise<CurrentSigningKey | null> {
    const pem = this.twentyConfigService.get('JWT_SIGNING_PRIVATE_KEY');

    if (!isDefined(pem) || pem.length === 0) {
      return null;
    }

    let privateKey: KeyObject;

    try {
      privateKey = createPrivateKey(pem);
    } catch (error) {
      this.logger.error(
        `JWT_SIGNING_PRIVATE_KEY is set but could not be parsed as a PEM private key. Falling back to legacy HS256 signing. Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }

    if (privateKey.asymmetricKeyType !== 'ec') {
      this.logger.error(
        `JWT_SIGNING_PRIVATE_KEY must be an EC P-256 private key (asymmetricKeyType=ec). Got "${privateKey.asymmetricKeyType}". Falling back to legacy HS256 signing.`,
      );

      return null;
    }

    const publicKey = createPublicKey(privateKey);
    const jwk = publicKey.export({ format: 'jwk' });

    if (jwk.kty !== 'EC' || jwk.crv !== 'P-256') {
      this.logger.error(
        `JWT_SIGNING_PRIVATE_KEY must be an EC P-256 (prime256v1) key. Got kty=${jwk.kty} crv=${jwk.crv}. Falling back to legacy HS256 signing.`,
      );

      return null;
    }

    const kid = computeJwkThumbprint(jwk);
    const publicKeyPem = publicKey
      .export({ format: 'pem', type: 'spki' })
      .toString();

    await this.upsertPublicKey({ kid, publicKeyPem });

    this.publicKeyCache.set(kid, publicKey);

    return { privateKey, publicKey, kid };
  }

  private async upsertPublicKey(args: {
    kid: string;
    publicKeyPem: string;
  }): Promise<void> {
    const existing = await this.jwtPublicKeyRepository.findOne({
      where: { kid: args.kid },
    });

    if (isDefined(existing)) {
      return;
    }

    try {
      await this.jwtPublicKeyRepository.insert({
        kid: args.kid,
        publicKey: args.publicKeyPem,
        algorithm: 'ES256',
        status: 'active',
      });
    } catch (error) {
      const stillExists = await this.jwtPublicKeyRepository.findOne({
        where: { kid: args.kid },
      });

      if (!isDefined(stillExists)) {
        throw error;
      }
    }
  }
}

const base64UrlEncode = (input: Buffer): string =>
  input
    .toString('base64')
    .replace(/=+$/u, '')
    .replace(/\+/gu, '-')
    .replace(/\//gu, '_');

export const computeJwkThumbprint = (jwk: JsonWebKey): string => {
  const canonical = canonicalizeJwk(jwk);
  const digest = createHash('sha256').update(canonical).digest();

  return base64UrlEncode(digest);
};

const canonicalizeJwk = (jwk: JsonWebKey): string => {
  if (jwk.kty === 'EC') {
    if (
      typeof jwk.crv !== 'string' ||
      typeof jwk.x !== 'string' ||
      typeof jwk.y !== 'string'
    ) {
      throw new Error('Invalid EC JWK: missing crv, x or y');
    }

    return JSON.stringify({ crv: jwk.crv, kty: 'EC', x: jwk.x, y: jwk.y });
  }

  if (jwk.kty === 'RSA') {
    if (typeof jwk.e !== 'string' || typeof jwk.n !== 'string') {
      throw new Error('Invalid RSA JWK: missing e or n');
    }

    return JSON.stringify({ e: jwk.e, kty: 'RSA', n: jwk.n });
  }

  if (jwk.kty === 'OKP') {
    if (typeof jwk.crv !== 'string' || typeof jwk.x !== 'string') {
      throw new Error('Invalid OKP JWK: missing crv or x');
    }

    return JSON.stringify({ crv: jwk.crv, kty: 'OKP', x: jwk.x });
  }

  throw new Error(`Unsupported JWK kty for thumbprint: ${jwk.kty}`);
};
