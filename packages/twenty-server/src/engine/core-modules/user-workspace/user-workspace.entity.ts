import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import {
  AGENT_CHAT_INBOX_NOTIFICATION_LEVEL,
  type AgentChatInboxNotificationLevel,
} from 'twenty-shared/ai';
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

import { ADD_USER_WORKSPACE_INBOX_NOTIFICATION_SETTINGS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-61/add-user-workspace-inbox-notification-settings-upgrade-command-name.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TwoFactorAuthenticationMethodSummaryDTO } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-method.dto';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { ObjectRecordsPermissionsDTO } from 'src/engine/permissions/dtos/object-records-permissions.dto';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

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

  @Field(() => String, { nullable: true })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_USER_WORKSPACE_INBOX_NOTIFICATION_SETTINGS_UPGRADE_COMMAND_NAME,
  })
  @Column({
    nullable: false,
    default: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED,
    type: 'varchar',
  })
  inboxNotificationLevel: AgentChatInboxNotificationLevel;

  @Field(() => Boolean, { nullable: true })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_USER_WORKSPACE_INBOX_NOTIFICATION_SETTINGS_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, default: true, type: 'boolean' })
  isInboxNotificationPreviewEnabled: boolean;

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

  @Field(() => [ObjectRecordsPermissionsDTO], { nullable: true })
  objectRecordsPermissions?: ObjectRecordsPermissionsDTO[];

  @Field(() => [TwoFactorAuthenticationMethodSummaryDTO], { nullable: true })
  twoFactorAuthenticationMethodSummary?: TwoFactorAuthenticationMethodSummaryDTO[];

  @Field(() => Boolean, { nullable: true })
  isImpersonating?: boolean;
}
