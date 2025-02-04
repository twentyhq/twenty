import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Agent } from 'src/engine/core-modules/agent/agent.entity';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
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

  @Field(() => WhatsappIntegration, { nullable: true })
  @ManyToOne(() => WhatsappIntegration, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'whatsappIntegrationId' })
  whatsappIntegration: Relation<WhatsappIntegration>;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Relation<Workspace>;

  @Field(() => [Agent])
  @ManyToMany(() => Agent, (agent) => agent.inboxes)
  agents: Agent[];
}
