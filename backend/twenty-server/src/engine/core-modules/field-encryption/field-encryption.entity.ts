import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum EncryptionAlgorithm {
  AES_256_GCM = 'aes-256-gcm',
  AES_256_CBC = 'aes-256-cbc',
}

export enum EncryptionKeyStatus {
  ACTIVE = 'active',
  ROTATING = 'rotating',
  REVOKED = 'revoked',
}

@Entity('field_encryption_key')
export class FieldEncryptionKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  encryptedKey: string;

  @Column({ type: 'text', nullable: true })
  publicKey: string;

  @Column({
    type: 'enum',
    enum: EncryptionAlgorithm,
    default: EncryptionAlgorithm.AES_256_GCM,
  })
  algorithm: EncryptionAlgorithm;

  @Column({
    type: 'enum',
    enum: EncryptionKeyStatus,
    default: EncryptionKeyStatus.ACTIVE,
  })
  status: EncryptionKeyStatus;

  @Column({ type: 'timestamp', nullable: true })
  rotatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('encrypted_field')
export class EncryptedFieldEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  objectName: string;

  @Column({ nullable: false })
  fieldName: string;

  @Column({ nullable: false })
  encryptionKeyId: string;

  @ManyToOne(() => FieldEncryptionKeyEntity)
  @JoinColumn({ name: 'encryptionKeyId' })
  encryptionKey: FieldEncryptionKeyEntity;

  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  allowedRoles: string[];

  @Column({ type: 'simple-array', nullable: true })
  excludedRoles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
