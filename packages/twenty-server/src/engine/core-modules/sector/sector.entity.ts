import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SectorTopic } from 'src/engine/core-modules/sector/types/SectorTopic';

@Entity({ name: 'sector', schema: 'core' })
@ObjectType('Sector')
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
}
