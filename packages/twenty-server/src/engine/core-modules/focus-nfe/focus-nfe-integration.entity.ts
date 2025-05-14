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

@Entity({ name: 'focusNfeIntegration', schema: 'core' })
@ObjectType('focusNfeIntegration')
export class FocusNfeIntegration {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ nullable: false })
  integrationName: string;

  @Field(() => String)
  @Column({ nullable: false })
  token: string;

  @Field(() => String, { defaultValue: 'active' })
  @Column({ default: 'active' })
  status: string;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Relation<Workspace>;
}
