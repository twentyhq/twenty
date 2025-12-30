import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

@Index('IDX_WEBHOOK_WORKSPACE_ID', ['workspaceId'])
@Entity({ name: 'webhook', schema: 'core' })
@ObjectType('Webhook')
export class WebhookEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  targetUrl: string;

  @Field(() => [String])
  @Column('text', { array: true, default: ['*.*'] })
  operations: string[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column()
  secret: string;

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
