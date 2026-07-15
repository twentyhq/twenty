import { isDefined } from 'twenty-shared/utils';
import {
  BeforeInsert,
  BeforeUpdate,
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

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum AppTokenType {
  RefreshToken = 'REFRESH_TOKEN',
  CodeChallenge = 'CODE_CHALLENGE',
  AuthorizationCode = 'AUTHORIZATION_CODE',
  PasswordResetToken = 'PASSWORD_RESET_TOKEN',
  InvitationToken = 'INVITATION_TOKEN',
  OnboardingInvitationToken = 'ONBOARDING_INVITATION_TOKEN',
  EmailVerificationToken = 'EMAIL_VERIFICATION_TOKEN',
  EnterpriseValidityToken = 'ENTERPRISE_VALIDITY_TOKEN',
  ApplicationRegistrationClaimToken = 'APPLICATION_REGISTRATION_CLAIM_TOKEN',
}

@Entity({ name: 'appToken', schema: 'core' })
// One pending claim challenge per (registration, workspace); other token
// types keep applicationRegistrationId null and are unaffected.
@Index(
  'IDX_APP_TOKEN_APPLICATION_REGISTRATION_WORKSPACE_CLAIM_UNIQUE',
  ['applicationRegistrationId', 'workspaceId'],
  {
    unique: true,
    where: `"type" = 'APPLICATION_REGISTRATION_CLAIM_TOKEN'`,
  },
)
export class AppTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.appTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<UserEntity>;

  @Column({ nullable: true })
  userId: string | null;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.appTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: true, type: 'uuid' })
  workspaceId: string | null;

  @ManyToOne(() => ApplicationRegistrationEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationRegistrationId' })
  applicationRegistration: Relation<ApplicationRegistrationEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.22.0_ReplaceApplicationRegistrationClaimWithAppTokenFastInstanceCommand_1784153821819',
  })
  applicationRegistrationId: string | null;

  @Column({ nullable: false, type: 'text', default: AppTokenType.RefreshToken })
  type: AppTokenType;

  @Column({ nullable: true, type: 'text' })
  value: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  revokedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  formatEmail?() {
    if (isDefined(this.context?.email)) {
      this.context.email = this.context.email.toLowerCase();
    }
  }

  @Column({ nullable: true, type: 'jsonb' })
  context: {
    email?: string;
    roleId?: string;
    redirectUri?: string;
    clientId?: string;
    codeChallenge?: string;
    scope?: string;
  } | null;
}
