import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  PermissionFlagType,
  PermissionsOnAllObjectRecords,
} from 'twenty-shared/constants';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
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
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TwoFactorAuthenticationMethodSummaryDto } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-method.dto';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

registerEnumType(PermissionFlagType, {
  name: 'PermissionFlagType',
});

registerEnumType(PermissionsOnAllObjectRecords, {
  name: 'PermissionsOnAllObjectRecords',
});

@Entity({ name: 'userWorkspace', schema: 'core' })
@ObjectType('UserWorkspace')
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
export class UserWorkspaceEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => UserEntity)
  @ManyToOne(() => UserEntity, (user) => user.userWorkspaces, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<UserEntity>;

  @Field(() => UUIDScalarType, { nullable: false })
  @Column()
  userId: string;

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
    () => TwoFactorAuthenticationMethodEntity,
    (twoFactorAuthenticationMethod) =>
      twoFactorAuthenticationMethod.userWorkspace,
    { nullable: true },
  )
  twoFactorAuthenticationMethods: Relation<
    TwoFactorAuthenticationMethodEntity[]
  >;

  @Field(() => [PermissionFlagType], { nullable: true })
  permissionFlags?: PermissionFlagType[];

  @Field(() => [ObjectPermissionDTO], { nullable: true })
  objectPermissions?: ObjectPermissionDTO[];

  @Field(() => [ObjectPermissionDTO], { nullable: true })
  objectsPermissions?: ObjectPermissionDTO[];

  @Field(() => [TwoFactorAuthenticationMethodSummaryDto], { nullable: true })
  twoFactorAuthenticationMethodSummary?: TwoFactorAuthenticationMethodSummaryDto[];
}
