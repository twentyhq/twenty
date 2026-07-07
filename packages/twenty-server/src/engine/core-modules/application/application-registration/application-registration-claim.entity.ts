import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// A pending ownership challenge for an unclaimed NPM-sourced registration.
// The workspace proves it controls the npm package by publishing a version
// whose package.json carries `twenty.claimCode` equal to `token`. Rows are
// ephemeral: one per (registration, workspace), removed once ownership is
// assigned or the registration is claimed by someone else.
@Entity({ name: 'applicationRegistrationClaim', schema: 'core' })
@Index(
  'IDX_APP_REGISTRATION_CLAIM_REGISTRATION_WORKSPACE_UNIQUE',
  ['applicationRegistrationId', 'workspaceId'],
  { unique: true },
)
export class ApplicationRegistrationClaimEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  applicationRegistrationId: string;

  @ManyToOne(() => ApplicationRegistrationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationRegistrationId' })
  applicationRegistration: Relation<ApplicationRegistrationEntity>;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: true, type: 'uuid' })
  createdByUserId: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: Relation<UserEntity> | null;

  @Column({ nullable: false, type: 'text' })
  token: string;

  @Column({ nullable: false, type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
