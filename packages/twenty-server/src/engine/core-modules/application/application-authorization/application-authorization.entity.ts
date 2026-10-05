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

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// One row per user authorization_code exchange: tokens are stateless JWTs, so this is the only record to list or revoke.
// client_credentials involves no user and has no row.
@Entity({ name: 'applicationAuthorization', schema: 'core' })
@Index(
  'IDX_APPLICATION_AUTHORIZATION_USER_APPLICATION_UNIQUE',
  ['userId', 'applicationId'],
  { unique: true },
)
export class ApplicationAuthorizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_APPLICATION_AUTHORIZATION_USER_ID',
  })
  user: Relation<UserEntity>;

  // No index of its own: it leads the class's unique index, which serves the per-user listing and the cascade delete
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'workspaceId',
    foreignKeyConstraintName: 'FK_APPLICATION_AUTHORIZATION_WORKSPACE_ID',
  })
  workspace: Relation<WorkspaceEntity>;

  @Index('IDX_APPLICATION_AUTHORIZATION_WORKSPACE_ID')
  @Column({ type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => ApplicationEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'applicationId',
    foreignKeyConstraintName: 'FK_APPLICATION_AUTHORIZATION_APPLICATION_ID',
  })
  application: Relation<ApplicationEntity>;

  @Index('IDX_APPLICATION_AUTHORIZATION_APPLICATION_ID')
  @Column({ type: 'uuid' })
  applicationId: string;

  // Cascades only on hard delete; member removal soft-deletes, so the refresh path rechecks membership
  @ManyToOne(() => UserWorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userWorkspaceId',
    foreignKeyConstraintName: 'FK_APPLICATION_AUTHORIZATION_USER_WORKSPACE_ID',
  })
  userWorkspace: Relation<UserWorkspaceEntity>;

  @Index('IDX_APPLICATION_AUTHORIZATION_USER_WORKSPACE_ID')
  @Column({ type: 'uuid' })
  userWorkspaceId: string;

  // As granted at the last exchange, i.e. what the user consented to; null on rows backfilled from pre-table refresh tokens (no scope claim)
  @Column({ type: 'text', array: true, nullable: true })
  scopes: string[] | null;

  // Null for the same reason, and on the same rows.
  @Column({ type: 'timestamptz', nullable: true })
  lastAuthorizedAt: Date | null;

  // Touched on refresh, at most once per access-token TTL, so no write throttling needed
  @Column({ type: 'timestamptz' })
  lastUsedAt: Date;

  // Revoked rows are kept: they tell a revoked refresh token apart from one predating this table
  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
