import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'billingPlans', schema: 'core' })
@ObjectType('BillingPlans')
export class BillingPlans {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  planId: string;

  // @Field()
  // @Column({ type: 'number', nullable: true })
  // planPrice: number;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  workspace: Relation<Workspace>;
}
