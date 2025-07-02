import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { SectorTopic } from 'src/engine/core-modules/sector/types/SectorTopic';
import { WorkspaceAgent } from 'src/engine/core-modules/workspace-agent/workspace-agent.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'sector', schema: 'core' })
@ObjectType()
export class Sector {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ defaultValue: '' })
  @Column({ default: '' })
  icon: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  name: string;

  @Field(() => [GraphQLJSON], { nullable: true })
  @Column('jsonb', { nullable: true })
  topics: SectorTopic[];

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Relation<Workspace>;

  @Field(() => [WorkspaceAgent])
  @ManyToMany(() => WorkspaceAgent, (agent) => agent.sectors)
  agents: WorkspaceAgent[];
}
