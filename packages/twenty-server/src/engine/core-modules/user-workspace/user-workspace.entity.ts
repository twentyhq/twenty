import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { SettingsFeatures } from 'twenty-shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TwoFactorMethod } from 'src/engine/core-modules/two-factor-method/two-factor-method.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

registerEnumType(SettingsFeatures, {
  name: 'SettingsFeatures',
});

@Entity({ name: 'userWorkspace', schema: 'core' })
@ObjectType()
@Unique('IndexOnUserIdAndWorkspaceIdUnique', ['userId', 'workspaceId'])
export class UserWorkspace {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.workspaces, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Field({ nullable: false })
  @Column()
  userId: string;

  @Field(() => Workspace, { nullable: true })
  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @Field({ nullable: false })
  @Column()
  workspaceId: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date;

  @OneToMany(
    () => TwoFactorMethod,
    (twoFactorMethod) => twoFactorMethod.userWorkspace,
  )
  twoFactorMethods: Relation<TwoFactorMethod[]>;

  @Field(() => [SettingsFeatures], { nullable: true })
  settingsPermissions?: SettingsFeatures[];
}
