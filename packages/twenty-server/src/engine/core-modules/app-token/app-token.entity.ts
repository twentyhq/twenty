import { Field, ObjectType } from '@nestjs/graphql';

import { BeforeCreateOne } from '@ptc-org/nestjs-query-graphql';
import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { BeforeCreateOneAppToken } from 'src/engine/core-modules/app-token/hooks/before-create-one-app-token.hook';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { BaseSoftDeleteEntity } from 'src/engine/utils/base-entities-fields';

export enum AppTokenType {
  RefreshToken = 'REFRESH_TOKEN',
  CodeChallenge = 'CODE_CHALLENGE',
  AuthorizationCode = 'AUTHORIZATION_CODE',
  PasswordResetToken = 'PASSWORD_RESET_TOKEN',
  InvitationToken = 'INVITATION_TOKEN',
  OIDCCodeVerifier = 'OIDC_CODE_VERIFIER',
  EmailVerificationToken = 'EMAIL_VERIFICATION_TOKEN',
}

@Entity({ name: 'appToken', schema: 'core' })
@ObjectType()
@BeforeCreateOne(BeforeCreateOneAppToken)
export class AppToken extends BaseSoftDeleteEntity {
  @ManyToOne(() => User, (user) => user.appTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column({ nullable: true })
  userId: string | null;

  @ManyToOne(() => Workspace, (workspace) => workspace.appTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @Column({ nullable: true })
  workspaceId: string;

  @Field()
  @Column({ nullable: false, type: 'text', default: AppTokenType.RefreshToken })
  type: AppTokenType;

  @Column({ nullable: true, type: 'text' })
  value: string;

  @Field()
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  revokedAt: Date | null;

  @Column({ nullable: true, type: 'jsonb' })
  context: { email: string } | null;
}
