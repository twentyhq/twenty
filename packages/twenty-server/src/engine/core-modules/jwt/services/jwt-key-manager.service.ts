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

    return createPublicKey(cachedPem);
  }

  private async loadOrCreateCurrentSigningKey(): Promise<CurrentSigningKey | null> {
    try {
      const existing = await this.findCurrentSigningKeyRow();

      if (isDefined(existing)) {
        return {
          id: existing.id,
          privateKey: this.decryptPrivateKey(existing.privateKey, existing.id),
          publicKey: createPublicKey(existing.publicKey),
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

    const privateKeyPem =
      this.secretEncryptionService.decrypt(encryptedPrivateKey);

    const key = createPrivateKey(privateKeyPem);

    if (key.asymmetricKeyType !== 'ec') {
      throw new JwtKeyManagerException(
        `Stored signing private key has unexpected asymmetricKeyType "${key.asymmetricKeyType}" (expected "ec")`,
        JwtKeyManagerExceptionCode.INVALID_PRIVATE_KEY,
      );
    }

    return key;
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
            publicKey: createPublicKey(existing.publicKey),
          };
        }
      }

      throw error;
    }
  }

  private generateEcP256KeyPair(): {
    privateKey: KeyObject;
    publicKey: KeyObject;
    privateKeyPem: string;
    publicKeyPem: string;
  } {
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
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error as QueryFailedError & { code?: string }).code ===
        UNIQUE_VIOLATION_PG_CODE
    );
  }
}
