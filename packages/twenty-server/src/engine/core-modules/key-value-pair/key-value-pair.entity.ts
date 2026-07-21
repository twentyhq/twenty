import { Field, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum KeyValuePairType {
  USER_VARIABLE = 'USER_VARIABLE',
  FEATURE_FLAG = 'FEATURE_FLAG',
  CONFIG_VARIABLE = 'CONFIG_VARIABLE',
  APPLICATION_VARIABLE = 'APPLICATION_VARIABLE',
}

@Entity({ name: 'keyValuePair', schema: 'core' })
@ObjectType('KeyValuePair')
@Unique('IDX_KEY_VALUE_PAIR_KEY_USER_ID_WORKSPACE_ID_UNIQUE', [
  'key',
  'userId',
  'workspaceId',
])
@Index(
  'IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE',
  ['key', 'workspaceId'],
  {
    unique: true,
    where: '"userId" is NULL AND "applicationId" is NULL',
  },
)
@Index(
  'IDX_KEY_VALUE_PAIR_KEY_USER_ID_NULL_WORKSPACE_ID_UNIQUE',
  ['key', 'userId'],
  {
    unique: true,
    where: '"workspaceId" is NULL',
  },
)
@Index(
  'IDX_KEY_VALUE_PAIR_KEY_NULL_USER_ID_NULL_WORKSPACE_ID_UNIQUE',
  ['key'],
  {
    unique: true,
    where:
      '"userId" is NULL AND "workspaceId" is NULL AND "applicationId" is NULL',
  },
)
@Index(
  'IDX_KEY_VALUE_PAIR_KEY_APPLICATION_ID_WORKSPACE_UNIQUE',
  ['key', 'applicationId'],
  {
    unique: true,
    where: '"applicationId" is NOT NULL AND "workspaceId" is NOT NULL',
  },
)
@Index(
  'IDX_KEY_VALUE_PAIR_KEY_APPLICATION_ID_GLOBAL_UNIQUE',
  ['key', 'applicationId'],
  {
    unique: true,
    where: '"applicationId" is NOT NULL AND "workspaceId" is NULL',
  },
)
@Index('IDX_KEY_VALUE_PAIR_APPLICATION_ID', ['applicationId'])
export class KeyValuePairEntity {
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.keyValuePairs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<UserEntity>;

  @Column({ nullable: true })
  userId: string | null;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.keyValuePairs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: true, type: 'uuid' })
  workspaceId: string | null;

  @ManyToOne(() => ApplicationEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      '2.23.0_AddApplicationIdToKeyValuePairFastInstanceCommand_1784659343818',
  })
  applicationId: string | null;

  @Field(() => String)
  @Column({ nullable: false, type: 'text' })
  key: string;

  @Field(() => JSON, { nullable: true })
  @Column('jsonb', { nullable: true })
  value: JSON;

  @Field(() => String)
  @Column({ nullable: true, type: 'text' })
  textValueDeprecated: string | null;

  @Field(() => KeyValuePairType)
  @Column({
    type: 'enum',
    enum: Object.values(KeyValuePairType),
    nullable: false,
    default: KeyValuePairType.USER_VARIABLE,
  })
  type: KeyValuePairType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date | null;
}
