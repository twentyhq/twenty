import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'stripeIntegration', schema: 'core' })
@ObjectType('StripeIntegration')
export class StripeIntegration {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'text', nullable: true })
  accountId: string;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, (workspace) => workspace.stripeIntegrations, {
    onDelete: 'CASCADE',
  })
  workspace: Relation<Workspace>;
}
