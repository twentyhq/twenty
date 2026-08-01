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

import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
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
  SSOExchangeToken = 'SSO_EXCHANGE_TOKEN',
}

@Entity({ name: 'appToken', schema: 'core' })
@Index('IDX_APP_TOKEN_TYPE_VALUE_SSO_EXCHANGE_UNIQUE', ['type', 'value'], {
  unique: true,
  where: `"type" = 'SSO_EXCHANGE_TOKEN' AND "deletedAt" IS NULL AND "revokedAt" IS NULL`,
})
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
    authProvider?: AuthProviderEnum;
  } | null;
}
