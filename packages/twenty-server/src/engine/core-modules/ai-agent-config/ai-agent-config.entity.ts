import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AiAgentConfigStatus } from 'src/engine/core-modules/ai-agent-config/enums/ai-agent-config-status.enum';

registerEnumType(AiAgentConfigStatus, {
  name: 'AiAgentConfigStatus',
  description: 'AI Agent Configuration Status',
});

@Entity({ name: 'aiAgentConfig', schema: 'core' })
@ObjectType()
export class AiAgentConfig {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'uuid' })
  objectMetadataId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'uuid' })
  viewId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'uuid' })
  fieldMetadataId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'uuid' })
  viewGroupId?: string;

  @Field()
  @Column({ nullable: false, type: 'text' })
  agent: string;

  @Field()
  @Column({ nullable: false, type: 'int', default: 3 })
  wipLimit: number;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'varchar', length: 5000 })
  additionalInput?: string;

  @Field(() => AiAgentConfigStatus)
  @Column({
    type: 'enum',
    enumName: 'aiAgentConfig_status_enum',
    enum: AiAgentConfigStatus,
    default: AiAgentConfigStatus.ENABLED,
  })
  status: AiAgentConfigStatus;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;
} 