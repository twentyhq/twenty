import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum UserSessionRevokedReason {
  UserSignOut = 'USER_SIGN_OUT',
  UserRevoked = 'USER_REVOKED',
  Superseded = 'SUPERSEDED',
  PasswordChanged = 'PASSWORD_CHANGED',
  AdminRevoked = 'ADMIN_REVOKED',
}

@Entity({ name: 'userSession', schema: 'core' })
export class UserSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // SHA-256 of the opaque session token; the raw token is never stored.
  @Index('IDX_USER_SESSION_TOKEN_HASH_UNIQUE', { unique: true })
  @Column({ type: 'text' })
  tokenHash: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_USER_SESSION_USER_ID',
  })
  user: Relation<UserEntity>;

  @Index('IDX_USER_SESSION_USER_ID')
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'workspaceId',
    foreignKeyConstraintName: 'FK_USER_SESSION_WORKSPACE_ID',
  })
  workspace: Relation<WorkspaceEntity> | null;

  // Null for workspace-agnostic sessions (multi-workspace picker).
  @Index('IDX_USER_SESSION_WORKSPACE_ID')
  @Column({ type: 'uuid', nullable: true })
  workspaceId: string | null;

  @Column({ type: 'uuid', nullable: true })
  userWorkspaceId: string | null;

  @Column({ type: 'text' })
  authProvider: AuthProviderEnum;

  @Column({ type: 'boolean', default: false })
  isImpersonating: boolean;

  @Column({ type: 'uuid', nullable: true })
  impersonatorUserWorkspaceId: string | null;

  @Column({ type: 'uuid', nullable: true })
  impersonatedUserWorkspaceId: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'text', nullable: true })
  ipAddress: string | null;

  // Absolute expiry, set at creation and never extended.
  @Index('IDX_USER_SESSION_EXPIRES_AT')
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  // Touched at most once per touch interval to limit write amplification.
  @Column({ type: 'timestamptz' })
  lastActiveAt: Date;

  @Index('IDX_USER_SESSION_REVOKED_AT')
  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  revokedReason: UserSessionRevokedReason | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
