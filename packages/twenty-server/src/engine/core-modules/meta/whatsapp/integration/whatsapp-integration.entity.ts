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

@Entity({ name: 'whatsappIntegration', schema: 'core' })
@ObjectType('WhatsappIntegration')
export class WhatsappIntegration {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  label: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  phoneId: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  businessAccountId: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  appId: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  appKey: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  accessToken: string;

  @Field({ defaultValue: false, nullable: false })
  @Column({ default: false })
  disabled: boolean;

  @Field({ defaultValue: 30, nullable: false })
  @Column({ default: 30 })
  sla: number;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Relation<Workspace>;
}
