import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import {
  type PermissionFlagType,
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
import { TwoFactorAuthenticationMethodSummaryDTO } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-method.dto';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { PERMISSION_FLAG_TYPE_WITH_LEGACY_KEYS } from 'src/engine/core-modules/user-workspace/enums/permission-flag-type-with-legacy-keys.enum';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { ObjectPermissionDTO } from 'src/engine/metadata-modules/object-permission/dtos/object-permission.dto';
import { type LegacyStandardPermissionFlagKey } from 'src/engine/metadata-modules/permission-flag/types/legacy-standard-permission-flag-key.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

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
  @Field(() => UUIDScalarType)
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

  @Field(() => [PERMISSION_FLAG_TYPE_WITH_LEGACY_KEYS], { nullable: true })
  permissionFlags?: (PermissionFlagType | LegacyStandardPermissionFlagKey)[];

  @Field(() => [ObjectPermissionDTO], { nullable: true })
  objectPermissions?: ObjectPermissionDTO[];

  @Field(() => [ObjectPermissionDTO], { nullable: true })
  objectsPermissions?: ObjectPermissionDTO[];

  @Field(() => [TwoFactorAuthenticationMethodSummaryDTO], { nullable: true })
  twoFactorAuthenticationMethodSummary?: TwoFactorAuthenticationMethodSummaryDTO[];

  @Field(() => Boolean, { nullable: true })
  isImpersonating?: boolean;
}
