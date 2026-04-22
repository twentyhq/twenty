import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

import { FieldEncryptionKeyEntity, EncryptedFieldEntity, EncryptionAlgorithm, EncryptionKeyStatus } from './field-encryption.entity';

@Injectable()
export class FieldEncryptionService {
  private readonly keyCache = new Map<string, Buffer>();

  constructor(
    @InjectRepository(FieldEncryptionKeyEntity)
    private readonly keyRepo: Repository<FieldEncryptionKeyEntity>,
    @InjectRepository(EncryptedFieldEntity)
    private readonly fieldRepo: Repository<EncryptedFieldEntity>,
  ) {}

  async createEncryptionKey(
    workspaceId: string,
    name: string,
    masterPassword: string,
    algorithm: EncryptionAlgorithm = EncryptionAlgorithm.AES_256_GCM,
  ): Promise<FieldEncryptionKeyEntity> {
    const salt = randomBytes(16);
    const key = scryptSync(masterPassword, salt, 32);
    
    const encryptedKey = this.encryptWithMaster(key, masterPassword, salt);

    const keyEntity = this.keyRepo.create({
      workspaceId,
      name,
      encryptedKey: encryptedKey.toString('base64'),
      algorithm,
      status: EncryptionKeyStatus.ACTIVE,
    });

    return this.keyRepo.save(keyEntity);
  }

  async getActiveKey(workspaceId: string): Promise<FieldEncryptionKeyEntity> {
    const key = await this.keyRepo.findOne({
      where: { workspaceId, status: EncryptionKeyStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    if (!key) {
      throw new NotFoundException(`No active encryption key found for workspace ${workspaceId}`);
    }

    return key;
  }

  async getEncryptedFields(workspaceId: string): Promise<EncryptedFieldEntity[]> {
    return this.fieldRepo.find({
      where: { workspaceId, isEnabled: true },
    });
  }

  async registerEncryptedField(
    workspaceId: string,
    objectName: string,
    fieldName: string,
    encryptionKeyId: string,
  ): Promise<EncryptedFieldEntity> {
    const field = this.fieldRepo.create({
      workspaceId,
      objectName,
      fieldName,
      encryptionKeyId,
    });

    return this.fieldRepo.save(field);
  }

  async enableEncryptedField(id: string, workspaceId: string): Promise<void> {
    await this.fieldRepo.update({ id, workspaceId }, { isEnabled: true });
  }

  async disableEncryptedField(id: string, workspaceId: string): Promise<void> {
    await this.fieldRepo.update({ id, workspaceId }, { isEnabled: false });
  }

  async rotateKey(
    workspaceId: string,
    newKeyId: string,
    masterPassword: string,
  ): Promise<void> {
    await this.keyRepo.update(
      { workspaceId, status: EncryptionKeyStatus.ACTIVE },
      { status: EncryptionKeyStatus.ROTATING, rotatedAt: new Date() },
    );

    await this.keyRepo.update(
      { id: newKeyId, workspaceId },
      { status: EncryptionKeyStatus.ACTIVE },
    );

    await this.fieldRepo.update(
      { workspaceId },
      { encryptionKeyId: newKeyId },
    );
  }

  async encryptField(workspaceId: string, fieldValue: string): Promise<string> {
    const keyEntity = await this.getActiveKey(workspaceId);
    const key = await this.getDecryptionKey(keyEntity, workspaceId);

    const iv = randomBytes(16);
    const cipher = createCipheriv(
      keyEntity.algorithm === EncryptionAlgorithm.AES_256_GCM ? 'aes-256-gcm' : 'aes-256-cbc',
      key,
      iv,
    );

    let encrypted = cipher.update(fieldValue, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = (cipher as any).getAuthTag();

    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  }

  async decryptField(workspaceId: string, encryptedValue: string): Promise<string> {
    const keyEntity = await this.getActiveKey(workspaceId);
    const key = await this.getDecryptionKey(keyEntity, workspaceId);

    const [ivBase64, authTagBase64, encrypted] = encryptedValue.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = createDecipheriv(
      keyEntity.algorithm === EncryptionAlgorithm.AES_256_GCM ? 'aes-256-gcm' : 'aes-256-cbc',
      key,
      iv,
    );

    if (keyEntity.algorithm === EncryptionAlgorithm.AES_256_GCM) {
      (decipher as any).setAuthTag(authTag);
    }

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private async getDecryptionKey(keyEntity: FieldEncryptionKeyEntity, workspaceId: string): Promise<Buffer> {
    const cacheKey = `${workspaceId}:${keyEntity.id}`;
    
    if (this.keyCache.has(cacheKey)) {
      return this.keyCache.get(cacheKey)!;
    }

    throw new Error('Master password required to decrypt field');
  }

  private encryptWithMaster(key: Buffer, masterPassword: string, salt: Buffer): Buffer {
    const keyMaterial = scryptSync(masterPassword, salt, 32);
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', keyMaterial, iv);
    
    let encrypted = cipher.update(key);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return Buffer.concat([salt, iv, encrypted]);
  }
}
