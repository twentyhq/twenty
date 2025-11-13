import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
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
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum KeyValuePairType {
  USER_VARIABLE = 'USER_VARIABLE',
  FEATURE_FLAG = 'FEATURE_FLAG',
  CONFIG_VARIABLE = 'CONFIG_VARIABLE',
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
    where: '"userId" is NULL',
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
export class KeyValuePairEntity {
  @IDField(() => UUIDScalarType)
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
