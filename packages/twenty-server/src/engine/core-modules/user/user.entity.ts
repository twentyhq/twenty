import { ID, Field, ObjectType } from '@nestjs/graphql';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

@Entity({ name: 'user', schema: 'core' })
@ObjectType('User')
export class User {
  @IDField(() => ID)
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
  emailVerified: boolean;

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
  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;

  @Field(() => Workspace, { nullable: false })
  @ManyToOne(() => Workspace, (workspace) => workspace.users, {
    onDelete: 'SET NULL',
  })
  defaultWorkspace: Workspace;

  @Field()
  @Column()
  defaultWorkspaceId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  passwordResetToken: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  passwordResetTokenExpiresAt: Date;

  @OneToMany(() => AppToken, (appToken) => appToken.user, {
    cascade: true,
  })
  appTokens: AppToken[];

  @Field(() => WorkspaceMember, { nullable: true })
  workspaceMember: WorkspaceMember;

  @Field(() => [UserWorkspace])
  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.user)
  workspaces: UserWorkspace[];
}
