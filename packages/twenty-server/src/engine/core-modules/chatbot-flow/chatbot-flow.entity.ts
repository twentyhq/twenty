import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import graphqlTypeJson from 'graphql-type-json';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'chatbotFlow', schema: 'core' })
@ObjectType('ChatbotFlow')
export class ChatbotFlow {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => [graphqlTypeJson], { nullable: true })
  @Column({ nullable: true, type: 'jsonb' })
  nodes: any[];

  @Field(() => [graphqlTypeJson], { nullable: true })
  @Column({ nullable: true, type: 'jsonb' })
  edges: any[];

  @Field({ nullable: false })
  @Column({ nullable: false, unique: true })
  chatbotId: string;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Relation<Workspace>;
}
