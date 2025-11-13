import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceMemberDTO } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

registerEnumType(OnboardingStatus, {
  name: 'OnboardingStatus',
  description: 'Onboarding status',
});

@Entity({ name: 'user', schema: 'core' })
@ObjectType('User')
@Index('UQ_USER_EMAIL', ['email'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
export class UserEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ default: '' })
  firstName: string;

  @Field()
  @Column({ default: '' })
  lastName: string;

  @BeforeInsert()
  @BeforeUpdate()
  formatEmail?() {
    this.email = this.email.toLowerCase();
  }

  @Field()
  @Column()
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  defaultAvatarUrl: string;

  @Field()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Field({ nullable: true })
  @Column({ default: false })
  disabled: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  passwordHash: string;

  @Field()
  @Column({ default: false })
  canImpersonate: boolean;

  @Field()
  @Column({ default: false })
  canAccessFullAdminPanel: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @Field(() => String, { nullable: false })
  @Column({ nullable: false, default: SOURCE_LOCALE, type: 'varchar' })
  locale: keyof typeof APP_LOCALES;

  @OneToMany(() => AppTokenEntity, (appToken) => appToken.user, {
    cascade: true,
  })
  appTokens: Relation<AppTokenEntity[]>;

  @OneToMany(() => KeyValuePairEntity, (keyValuePair) => keyValuePair.user, {
    cascade: true,
  })
  keyValuePairs: Relation<KeyValuePairEntity[]>;

  @Field(() => WorkspaceMemberDTO, { nullable: true })
  workspaceMember: Relation<WorkspaceMemberDTO>;

  @Field(() => [UserWorkspaceEntity])
  @OneToMany(
    () => UserWorkspaceEntity,
    (userWorkspace: UserWorkspaceEntity) => userWorkspace.user,
  )
  userWorkspaces: Relation<UserWorkspaceEntity[]>;

  @Field(() => OnboardingStatus, { nullable: true })
  onboardingStatus: OnboardingStatus;

  @Field(() => WorkspaceEntity, { nullable: true })
  currentWorkspace?: Relation<WorkspaceEntity>;

  @Field(() => UserWorkspaceEntity, { nullable: true })
  currentUserWorkspace?: Relation<UserWorkspaceEntity>;
}
