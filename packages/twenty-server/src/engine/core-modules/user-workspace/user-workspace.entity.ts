import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
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
import { ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';

registerEnumType(SettingPermissionType, {
  name: 'SettingPermissionType',
});

registerEnumType(PermissionsOnAllObjectRecords, {
  name: 'PermissionsOnAllObjectRecords',
});

@Entity({ name: 'userWorkspace', schema: 'core' })
@ObjectType()
@Unique('IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE', [
  'userId',
  'workspaceId',
])
@Index('IDX_USER_WORKSPACE_USER_ID', ['userId'])
@Index('IDX_USER_WORKSPACE_WORKSPACE_ID', ['workspaceId'])
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

  @Column({ nullable: true })
  defaultAvatarUrl: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @OneToMany(
    () => TwoFactorMethod,
    (twoFactorMethod) => twoFactorMethod.userWorkspace,
  )
  twoFactorMethods: Relation<TwoFactorMethod[]>;

  @Field(() => [SettingPermissionType], { nullable: true })
  settingsPermissions?: SettingPermissionType[];

  @Field(() => [PermissionsOnAllObjectRecords], {
    nullable: true,
    deprecationReason: 'Use objectPermissions instead',
  })
  objectRecordsPermissions?: PermissionsOnAllObjectRecords[];

  @Field(() => [ObjectPermissionDTO], { nullable: true })
  objectPermissions?: ObjectPermissionDTO[];
}
