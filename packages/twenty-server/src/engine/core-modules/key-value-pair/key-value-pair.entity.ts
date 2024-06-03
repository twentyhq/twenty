import { Field, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'keyValuePair', schema: 'core' })
@ObjectType('KeyValuePair')
@Unique('IndexOnKeyUserIdWorkspaceIdUnique', ['key', 'userId', 'workspaceId'])
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
  userId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.keyValuePairs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @Column({ nullable: true })
  workspaceId: string;

  @Field(() => String)
  @Column({ nullable: false, type: 'text' })
  key: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  value: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt: Date | null;
}
