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
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export enum KeyValuePairType {
  USER_VAR = 'USER_VAR',
  FEATURE_FLAG = 'FEATURE_FLAG',
  SYSTEM_VAR = 'SYSTEM_VAR',
}

@Entity({ name: 'keyValuePair', schema: 'core' })
@ObjectType('KeyValuePair')
@Unique('IndexOnKeyUserIdWorkspaceIdUnique', ['key', 'userId', 'workspaceId'])
@Index('IndexOnKeyWorkspaceIdAndNullUserIdUnique', ['key', 'workspaceId'], {
  unique: true,
  where: '"userId" is NULL',
})
@Index('IndexOnKeyUserIdAndNullWorkspaceIdUnique', ['key', 'userId'], {
  unique: true,
  where: '"workspaceId" is NULL',
})
export class KeyValuePair {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.keyValuePairs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column({ nullable: true })
  userId: string | null;

  @ManyToOne(() => Workspace, (workspace) => workspace.keyValuePairs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @Column({ nullable: true })
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
    default: KeyValuePairType.USER_VAR,
  })
  type: KeyValuePairType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date | null;
}
