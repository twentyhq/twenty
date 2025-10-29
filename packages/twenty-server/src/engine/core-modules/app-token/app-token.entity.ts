import { Field, ObjectType } from '@nestjs/graphql';

import { BeforeCreateOne, IDField } from '@ptc-org/nestjs-query-graphql';
import { isDefined } from 'twenty-shared/utils';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BeforeCreateOneAppToken } from 'src/engine/core-modules/app-token/hooks/before-create-one-app-token.hook';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum AppTokenType {
  RefreshToken = 'REFRESH_TOKEN',
  CodeChallenge = 'CODE_CHALLENGE',
  AuthorizationCode = 'AUTHORIZATION_CODE',
  PasswordResetToken = 'PASSWORD_RESET_TOKEN',
  InvitationToken = 'INVITATION_TOKEN',
  EmailVerificationToken = 'EMAIL_VERIFICATION_TOKEN',
}

@Entity({ name: 'appToken', schema: 'core' })
@ObjectType('AppToken')
@BeforeCreateOne(BeforeCreateOneAppToken)
export class AppTokenEntity {
  @IDField(() => UUIDScalarType)
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

  @Field()
  @Column({ nullable: false, type: 'text', default: AppTokenType.RefreshToken })
  type: AppTokenType;

  @Column({ nullable: true, type: 'text' })
  value: string;

  @Field()
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date | null;

  @Column({ nullable: true, type: 'timestamptz' })
  revokedAt: Date | null;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
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
  context: { email: string } | null;
}
