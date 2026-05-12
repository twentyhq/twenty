import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  type KeyObject,
} from 'crypto';

import { isDefined } from 'twenty-shared/utils';
import { QueryFailedError, Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import {
  JwtKeyManagerException,
  JwtKeyManagerExceptionCode,
} from 'src/engine/core-modules/jwt/jwt-key-manager.exception';
import { computeJwkThumbprint } from 'src/engine/core-modules/jwt/utils/compute-jwk-thumbprint.util';
import { isJwkThumbprint } from 'src/engine/core-modules/jwt/utils/is-jwk-thumbprint.util';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

export type CurrentSigningKey = {
  privateKey: KeyObject;
  publicKey: KeyObject;
  kid: string;
};

const UNIQUE_VIOLATION_PG_CODE = '23505';

@Injectable()
export class JwtKeyManagerService {
  private readonly logger = new Logger(JwtKeyManagerService.name);

  private currentSigningKeyPromise: Promise<CurrentSigningKey | null> | null =
    null;

  constructor(
    @InjectRepository(SigningKeyEntity)
    private readonly signingKeyRepository: Repository<SigningKeyEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async getCurrentSigningKey(): Promise<CurrentSigningKey | null> {
    if (this.currentSigningKeyPromise === null) {
      this.currentSigningKeyPromise = this.loadOrCreateCurrentSigningKey();
    }

    try {
      return await this.currentSigningKeyPromise;
    } catch (error) {
      this.currentSigningKeyPromise = null;
      throw error;
    }
  }

  async getActivePublicKeyByKid(kid: string): Promise<KeyObject | null> {
    if (!isJwkThumbprint(kid)) {
      return null;
    }

    const cachedPem = await this.coreEntityCacheService.get(
      'signingKeyPublicKey',
      kid,
    );

    if (!isDefined(cachedPem)) {
      return null;
    }

    return this.tryParsePublicKey(cachedPem, kid);
  }

  private async loadOrCreateCurrentSigningKey(): Promise<CurrentSigningKey | null> {
    try {
      const existing = await this.findCurrentRow();

      if (isDefined(existing)) {
        return this.materializeFromRow(existing);
      }

      return await this.generateAndPersistCurrent();
    } catch (error) {
      this.logger.error(
        `Failed to load or create current signing key. Falling back to legacy HS256 signing. Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
  }

  private async findCurrentRow(): Promise<SigningKeyEntity | null> {
    return this.signingKeyRepository
      .createQueryBuilder('signingKey')
      .where('signingKey.isCurrent = :isCurrent', { isCurrent: true })
      .andWhere('signingKey.revokedAt IS NULL')
      .getOne();
  }

  private materializeFromRow(row: SigningKeyEntity): CurrentSigningKey {
    if (!isDefined(row.privateKey)) {
      throw new JwtKeyManagerException(
        `Current signing key row (kid=${row.kid}) has no privateKey`,
        JwtKeyManagerExceptionCode.INVALID_PRIVATE_KEY,
      );
    }

    let privateKeyPem: string;

    try {
      privateKeyPem = this.secretEncryptionService.decrypt(row.privateKey);
    } catch (error) {
      throw new JwtKeyManagerException(
        `Failed to decrypt current signing key (kid=${row.kid}): ${
          error instanceof Error ? error.message : String(error)
        }`,
        JwtKeyManagerExceptionCode.SIGNING_KEY_DECRYPTION_FAILED,
      );
    }

    const privateKey = this.parsePrivateKeyOrThrow(privateKeyPem);
    const publicKey = this.parsePublicKeyOrThrow(row.publicKey);

    return { privateKey, publicKey, kid: row.kid };
  }

  private async generateAndPersistCurrent(): Promise<CurrentSigningKey> {
    const generated = this.generateEcP256KeyPair();

    try {
      await this.signingKeyRepository.insert({
        kid: generated.kid,
        publicKey: generated.publicKeyPem,
        privateKey: this.secretEncryptionService.encrypt(
          generated.privateKeyPem,
        ),
        isCurrent: true,
        revokedAt: null,
      });

      return {
        privateKey: generated.privateKey,
        publicKey: generated.publicKey,
        kid: generated.kid,
      };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        const existing = await this.findCurrentRow();

        if (isDefined(existing)) {
          return this.materializeFromRow(existing);
        }
      }

      throw new JwtKeyManagerException(
        `Failed to persist new signing key (kid=${generated.kid}): ${
          error instanceof Error ? error.message : String(error)
        }`,
        JwtKeyManagerExceptionCode.SIGNING_KEY_PERSISTENCE_FAILED,
      );
    }
  }

  private generateEcP256KeyPair(): {
    privateKey: KeyObject;
    publicKey: KeyObject;
    privateKeyPem: string;
    publicKeyPem: string;
    kid: string;
  } {
    try {
      const { privateKey, publicKey } = generateKeyPairSync('ec', {
        namedCurve: 'P-256',
      });

      const jwk = publicKey.export({ format: 'jwk' });
      const kid = computeJwkThumbprint(jwk);

      const privateKeyPem = privateKey
        .export({ format: 'pem', type: 'pkcs8' })
        .toString();
      const publicKeyPem = publicKey
        .export({ format: 'pem', type: 'spki' })
        .toString();

      return { privateKey, publicKey, privateKeyPem, publicKeyPem, kid };
    } catch (error) {
      throw new JwtKeyManagerException(
        `Failed to generate EC P-256 signing key: ${
          error instanceof Error ? error.message : String(error)
        }`,
        JwtKeyManagerExceptionCode.SIGNING_KEY_GENERATION_FAILED,
      );
    }
  }

  private parsePrivateKeyOrThrow(pem: string): KeyObject {
    try {
      const key = createPrivateKey(pem);

      if (key.asymmetricKeyType !== 'ec') {
        throw new JwtKeyManagerException(
          `Stored signing private key has unexpected asymmetricKeyType "${key.asymmetricKeyType}" (expected "ec")`,
          JwtKeyManagerExceptionCode.INVALID_PRIVATE_KEY,
        );
      }

      return key;
    } catch (error) {
      if (error instanceof JwtKeyManagerException) {
        throw error;
      }

      throw new JwtKeyManagerException(
        `Failed to parse signing private key: ${
          error instanceof Error ? error.message : String(error)
        }`,
        JwtKeyManagerExceptionCode.INVALID_PRIVATE_KEY,
      );
    }
  }

  private parsePublicKeyOrThrow(pem: string): KeyObject {
    try {
      return createPublicKey(pem);
    } catch (error) {
      throw new JwtKeyManagerException(
        `Failed to parse signing public key: ${
          error instanceof Error ? error.message : String(error)
        }`,
        JwtKeyManagerExceptionCode.INVALID_PUBLIC_KEY,
      );
    }
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

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { code?: string }).code ===
        UNIQUE_VIOLATION_PG_CODE
    );
  }
}
