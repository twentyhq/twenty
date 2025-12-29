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
import { WorkspaceBoundEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-bound-entity';

@Index('IDX_API_KEY_WORKSPACE_ID', ['workspaceId'])
@Entity({ name: 'apiKey', schema: 'core' })
@ObjectType('ApiKey')
export class ApiKeyEntity extends WorkspaceBoundEntity {
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
  revokedAt?: Date | null;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
