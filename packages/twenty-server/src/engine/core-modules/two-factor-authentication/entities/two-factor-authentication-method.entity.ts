import { TwoFactorAuthenticationStrategy } from 'twenty-shared/types';
import {
  Check,
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

import { OTPStatus } from 'src/engine/core-modules/two-factor-authentication/strategies/otp/otp.constants';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Index(['userWorkspaceId', 'strategy'], { unique: true })
@Entity({ name: 'twoFactorAuthenticationMethod', schema: 'core' })
// Mirrors the SQL constraint added by the 2.5 slow instance command that
// backfills TOTP secrets to the enc:v2 envelope. The keyId portion is not
// constrained so future ENCRYPTION_KEY rotations do not require a DDL
// migration.
@Check(
  'CHK_twoFactorAuthenticationMethod_secret_encrypted',
  `"secret" LIKE 'enc:v2:%'`,
)
export class TwoFactorAuthenticationMethodEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index()
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  userWorkspaceId: string;

  @ManyToOne(
    () => UserWorkspaceEntity,
    (userWorkspace) => userWorkspace.twoFactorAuthenticationMethods,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: Relation<UserWorkspaceEntity>;

  @Column({ nullable: false, type: 'text' })
  secret: string;

  @Column({
    type: 'enum',
    enum: OTPStatus,
    nullable: false,
  })
  status: OTPStatus;

  @Column({
    type: 'enum',
    enum: TwoFactorAuthenticationStrategy,
  })
  strategy: TwoFactorAuthenticationStrategy;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;
}
