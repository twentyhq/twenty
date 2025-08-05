import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Index('IDX_WEBHOOK_WORKSPACE_ID', ['workspaceId'])
@Entity({ name: 'webhook', schema: 'core' })
@ObjectType('Webhook')
export class Webhook {
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

  @Field(() => UUIDScalarType)
  @Column('uuid')
  workspaceId: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, (workspace) => workspace.webhooks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;
}
