import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ExposedWorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/exposed-workspace-related-entity';

@Index('IDX_API_KEY_WORKSPACE_ID', ['workspaceId'])
@Entity({ name: 'apiKey', schema: 'core' })
@ObjectType('ApiKey')
export class ApiKeyEntity extends ExposedWorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => Date)
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  revokedAt?: Date | null;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
