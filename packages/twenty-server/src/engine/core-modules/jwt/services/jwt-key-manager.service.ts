import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createPrivateKey, createPublicKey, type KeyObject } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { JwtPublicKeyEntity } from 'src/engine/core-modules/jwt/entities/jwt-public-key.entity';
import {
  JwtKeyManagerException,
  JwtKeyManagerExceptionCode,
} from 'src/engine/core-modules/jwt/jwt-key-manager.exception';
import { computeJwkThumbprint } from 'src/engine/core-modules/jwt/utils/compute-jwk-thumbprint.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export type CurrentSigningKey = {
  privateKey: KeyObject;
  publicKey: KeyObject;
  kid: string;
};

const PUBLIC_KEY_CACHE_TTL_MS = 60_000;

@Injectable()
export class JwtKeyManagerService {
  private readonly logger = new Logger(JwtKeyManagerService.name);

  private currentSigningKeyPromise: Promise<CurrentSigningKey | null> | null =
    null;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(JwtPublicKeyEntity)
    private readonly jwtPublicKeyRepository: Repository<JwtPublicKeyEntity>,
    @InjectCacheStorage(CacheStorageNamespace.EngineJwtPublicKey)
    private readonly cacheStorageService: CacheStorageService,
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

  async getActivePublicKeyByKid(kid: string): Promise<KeyObject | null> {
    if (!isNonEmptyString(kid)) {
      return null;
    }

    const cachedPem = await this.cacheStorageService.get<string>(kid);

    if (isDefined(cachedPem)) {
      return this.tryParsePublicKey(cachedPem, kid);
    }

    const row = await this.jwtPublicKeyRepository.findOne({
      where: { kid, revokedAt: IsNull() },
    });

    if (!isDefined(row)) {
      return null;
    }

    const publicKey = this.tryParsePublicKey(row.publicKey, kid);

    if (publicKey === null) {
      return null;
    }

    await this.cacheStorageService.set<string>(
      kid,
      row.publicKey,
      PUBLIC_KEY_CACHE_TTL_MS,
    );

    return publicKey;
  }

  private tryParsePublicKey(pem: string, kid: string): KeyObject | null {
    try {
      return createPublicKey(pem);
    } catch (error) {
      this.logger.error(
        `Failed to parse public key for kid=${kid}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
  }

  private async loadAndRegisterSigningKey(): Promise<CurrentSigningKey | null> {
    const pem = this.twentyConfigService.get('JWT_SIGNING_PRIVATE_KEY');

    if (!isNonEmptyString(pem)) {
      return null;
    }

    const privateKey = this.tryParsePrivateKey(pem);

    if (privateKey === null) {
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

    return { privateKey, publicKey, kid };
  }

  private tryParsePrivateKey(pem: string): KeyObject | null {
    try {
      return createPrivateKey(pem);
    } catch (error) {
      this.logger.error(
        `JWT_SIGNING_PRIVATE_KEY is set but could not be parsed as a PEM private key. Falling back to legacy HS256 signing. Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
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
        revokedAt: null,
      });
    } catch (error) {
      const stillExists = await this.jwtPublicKeyRepository.findOne({
        where: { kid: args.kid },
      });

      if (!isDefined(stillExists)) {
        throw new JwtKeyManagerException(
          `Failed to persist JWT public key (kid=${args.kid}): ${
            error instanceof Error ? error.message : String(error)
          }`,
          JwtKeyManagerExceptionCode.PUBLIC_KEY_PERSISTENCE_FAILED,
        );
      }
    }
  }
}
