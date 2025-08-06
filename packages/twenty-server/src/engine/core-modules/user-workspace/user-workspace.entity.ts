import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { PermissionsOnAllObjectRecords } from 'twenty-shared/constants';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
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
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TwoFactorAuthenticationMethodSummaryDto } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-method.dto';
import { TwoFactorAuthenticationMethod } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

registerEnumType(PermissionFlagType, {
  name: 'PermissionFlagType',
});

registerEnumType(PermissionsOnAllObjectRecords, {
  name: 'PermissionsOnAllObjectRecords',
});

@Entity({ name: 'userWorkspace', schema: 'core' })
@ObjectType()
@Index(
  'IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE',
  ['userId', 'workspaceId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
@Index('IDX_USER_WORKSPACE_USER_ID', ['userId'])
@Index('IDX_USER_WORKSPACE_WORKSPACE_ID', ['workspaceId'])
export class UserWorkspace {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.userWorkspaces, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Field(() => UUIDScalarType, { nullable: false })
  @Column()
  userId: string;

  @Field(() => Workspace, { nullable: true })
  @ManyToOne(() => Workspace, (workspace) => workspace.workspaceUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @Field(() => UUIDScalarType, { nullable: false })
  @Column()
  workspaceId: string;

  @Column({ nullable: true })
  defaultAvatarUrl: string;

  @Field(() => String, { nullable: false })
  @Column({ nullable: false, default: SOURCE_LOCALE, type: 'varchar' })
  locale: keyof typeof APP_LOCALES;

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
    () => TwoFactorAuthenticationMethod,
    (twoFactorAuthenticationMethod) =>
      twoFactorAuthenticationMethod.userWorkspace,
    { nullable: true },
  )
  twoFactorAuthenticationMethods: Relation<TwoFactorAuthenticationMethod[]>;

  @Field(() => [PermissionFlagType], { nullable: true })
  permissionFlags?: PermissionFlagType[];

  @Field(() => [PermissionsOnAllObjectRecords], {
    nullable: true,
    deprecationReason: 'Use objectPermissions instead',
  })
  objectRecordsPermissions?: PermissionsOnAllObjectRecords[];

  @Field(() => [ObjectPermissionDTO], { nullable: true })
  objectPermissions?: ObjectPermissionDTO[];

  @Field(() => [TwoFactorAuthenticationMethodSummaryDto], { nullable: true })
  twoFactorAuthenticationMethodSummary?: TwoFactorAuthenticationMethodSummaryDto[];
}
