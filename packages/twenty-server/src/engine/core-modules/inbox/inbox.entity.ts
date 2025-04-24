import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Agent } from 'src/engine/core-modules/agent/agent.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export enum IntegrationType {
  WHATSAPP = 'whatsapp',
  MESSENGER = 'messenger',
}

registerEnumType(IntegrationType, {
  name: 'IntegrationType',
  description: 'Available integration types',
});

@Entity({ name: 'inbox', schema: 'core' })
@ObjectType('Inbox')
export class Inbox {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => IntegrationType)
  @Column({
    type: 'enum',
    enum: IntegrationType,
    default: IntegrationType.WHATSAPP,
  })
  integrationType: IntegrationType;

  @Field({ nullable: false })
  @Column({ nullable: false })
  whatsappIntegrationId: string;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Relation<Workspace>;

  @Field(() => [Agent])
  @ManyToMany(() => Agent, (agent) => agent.inboxes)
  agents: Agent[];
}
