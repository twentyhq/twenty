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

// One row per user who has completed an OAuth authorization_code exchange for
// an application. Application tokens are stateless JWTs carrying the user as a
// claim, so without this row the server has no record that the authorization
// happened and nothing to list or revoke. Only authorization_code issues a
// refresh token; client_credentials returns an access token alone and involves
// no user, so it has no row here.
@Entity({ name: 'applicationAuthorization', schema: 'core' })
// Re-authorizing the same application updates this row rather than adding a
// second one, so a user never accumulates duplicate entries for one app.
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

  // No index of its own: it leads the unique index declared on the class, which
  // already serves both the per-user listing and the cascade delete.
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

  // Uninstalling deletes the application row, which already invalidates every
  // token issued for it. Cascading here stops the grants outliving the install
  // they describe.
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

  // Cascades only on a hard delete. Removing a member soft-deletes the
  // membership instead, which leaves this row intact, so the refresh path
  // rechecks the membership rather than trusting the grant to have gone.
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

  // Scopes as granted at the last exchange, which is what the user consented to
  // and therefore what the revocation screen should show them. Null on a row
  // reconstructed from a refresh token that predates this table: those tokens
  // carry no scope claim, and what the application declares today is not
  // evidence of what the user agreed to back then.
  @Column({ type: 'text', array: true, nullable: true })
  scopes: string[] | null;

  // Null for the same reason, and on the same rows.
  @Column({ type: 'timestamptz', nullable: true })
  lastAuthorizedAt: Date | null;

  // Touched on refresh. Refreshes happen at most once per access-token TTL, so
  // this needs no write throttling of its own.
  @Column({ type: 'timestamptz' })
  lastUsedAt: Date;

  // Kept forever once set: a revoked row is what tells a still-signed refresh
  // token apart from one issued before authorizations were recorded.
  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
