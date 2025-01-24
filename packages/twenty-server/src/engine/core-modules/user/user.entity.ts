import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
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
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

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
export class User {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ default: '' })
  firstName: string;

  @Field()
  @Column({ default: '' })
  lastName: string;

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
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @OneToMany(() => AppToken, (appToken) => appToken.user, {
    cascade: true,
  })
  appTokens: Relation<AppToken[]>;

  @OneToMany(() => KeyValuePair, (keyValuePair) => keyValuePair.user, {
    cascade: true,
  })
  keyValuePairs: Relation<KeyValuePair[]>;

  @Field(() => WorkspaceMember, { nullable: true })
  workspaceMember: Relation<WorkspaceMember>;

  @Field(() => [UserWorkspace])
  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.user)
  workspaces: Relation<UserWorkspace[]>;

  @Field(() => OnboardingStatus, { nullable: true })
  onboardingStatus: OnboardingStatus;

  @Field(() => Workspace, { nullable: true })
  currentWorkspace: Relation<Workspace>;
}
