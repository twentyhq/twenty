import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@ObjectType()
export class FlowData {
  @Field(() => [String], { nullable: true })
  data?: string[];
}

@Entity({ name: 'chatbotFlow', schema: 'core' })
@ObjectType('ChatbotFlow')
export class ChatbotFlow {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => FlowData, { nullable: true })
  @Column({ nullable: true, type: 'jsonb' })
  nodes: FlowData | null;

  @Field(() => FlowData, { nullable: true })
  @Column({ nullable: true, type: 'jsonb' })
  edges: FlowData | null;

  @Field({ nullable: false })
  @Column({ nullable: false })
  chatbotId: string;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: string;
}

/* 
  "nodes":{
    "data":{
      "label":"Start"
    },
    "id":"1",
    "position":{
      "x":54.13666357028799,
      "y":-30.356708011741176
    },
    "type":"input"
  }
*/
