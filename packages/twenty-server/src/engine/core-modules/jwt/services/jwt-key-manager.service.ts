import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  type KeyObject,
  randomUUID,
} from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IsNull, QueryFailedError, Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import {
  JwtKeyManagerException,
  JwtKeyManagerExceptionCode,
} from 'src/engine/core-modules/jwt/jwt-key-manager.exception';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

export type CurrentSigningKey = {
  privateKey: KeyObject;
  publicKey: KeyObject;
  id: string;
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

  async getValidPublicKeyById(id: string): Promise<KeyObject | null> {
    if (!isNonEmptyString(id) || !isValidUuid(id)) {
      return null;
    }

    const cachedPem = await this.coreEntityCacheService.get(
      'signingKeyPublicKey',
      id,
    );

    if (!isDefined(cachedPem)) {
      return null;
    }

    return this.tryParsePublicKey(cachedPem, id);
  }

  private async loadOrCreateCurrentSigningKey(): Promise<CurrentSigningKey | null> {
    try {
      const existing = await this.findCurrentSigningKeyRow();

      if (isDefined(existing)) {
        return {
          id: existing.id,
          privateKey: this.decryptPrivateKey(existing.privateKey, existing.id),
          publicKey: this.parsePublicKeyOrThrow(existing.publicKey),
        };
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

  private async findCurrentSigningKeyRow(): Promise<SigningKeyEntity | null> {
    return this.signingKeyRepository.findOne({
      where: { isCurrent: true, revokedAt: IsNull() },
    });
  }

  private decryptPrivateKey(
    encryptedPrivateKey: string | null,
    id: string,
  ): KeyObject {
    if (!isDefined(encryptedPrivateKey)) {
      throw new JwtKeyManagerException(
        `Current signing key (id=${id}) has no privateKey`,
        JwtKeyManagerExceptionCode.INVALID_PRIVATE_KEY,
      );
    }

    let privateKeyPem: string;

    try {
      privateKeyPem = this.secretEncryptionService.decrypt(encryptedPrivateKey);
    } catch (error) {
      throw new JwtKeyManagerException(
        `Failed to decrypt current signing key (id=${id}): ${
          error instanceof Error ? error.message : String(error)
        }`,
        JwtKeyManagerExceptionCode.SIGNING_KEY_DECRYPTION_FAILED,
      );
    }

    return this.parsePrivateKeyOrThrow(privateKeyPem);
  }

  private async generateAndPersistCurrent(): Promise<CurrentSigningKey> {
    const generated = this.generateEcP256KeyPair();
    const id = randomUUID();

    try {
      await this.signingKeyRepository.insert({
        id,
        publicKey: generated.publicKeyPem,
        privateKey: this.secretEncryptionService.encrypt(
          generated.privateKeyPem,
        ),
        isCurrent: true,
        revokedAt: null,
      });

      return {
        id,
        privateKey: generated.privateKey,
        publicKey: generated.publicKey,
      };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        const existing = await this.findCurrentSigningKeyRow();

        if (isDefined(existing)) {
          return {
            id: existing.id,
            privateKey: this.decryptPrivateKey(
              existing.privateKey,
              existing.id,
            ),
            publicKey: this.parsePublicKeyOrThrow(existing.publicKey),
          };
        }
      }

      throw new JwtKeyManagerException(
        `Failed to persist new signing key (id=${id}): ${
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
  } {
    try {
      const { privateKey, publicKey } = generateKeyPairSync('ec', {
        namedCurve: 'P-256',
      });

      const privateKeyPem = privateKey
        .export({ format: 'pem', type: 'pkcs8' })
        .toString();
      const publicKeyPem = publicKey
        .export({ format: 'pem', type: 'spki' })
        .toString();

      return { privateKey, publicKey, privateKeyPem, publicKeyPem };
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

  private tryParsePublicKey(pem: string, id: string): KeyObject | null {
    try {
      return createPublicKey(pem);
    } catch (error) {
      this.logger.error(
        `Failed to parse public key for id=${id}: ${
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
