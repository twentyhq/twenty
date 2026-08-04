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
import { type UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'userSession', schema: 'core' })
export class UserSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Index('IDX_USER_SESSION_WORKSPACE_ID')
  @Column({ type: 'uuid', nullable: true })
  workspaceId: string | null;

  // Removing someone from a workspace deletes the membership, not the
  // workspace, so without the cascade a dead session lingers until expiry.
  @ManyToOne(() => UserWorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userWorkspaceId',
    foreignKeyConstraintName: 'FK_USER_SESSION_USER_WORKSPACE_ID',
  })
  userWorkspace: Relation<UserWorkspaceEntity> | null;

  @Index('IDX_USER_SESSION_USER_WORKSPACE_ID')
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

  @Index('IDX_USER_SESSION_EXPIRES_AT')
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

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
