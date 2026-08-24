import { Field, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/enums/limit-kind.type';
import { type LimitValueType } from 'src/engine/core-modules/usage-limit/enums/limit-value-type.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/enums/spender-type.type';
import { bigintColumnTransformer } from 'src/engine/core-modules/usage-limit/utils/bigint-column-transformer.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Index('IDX_USAGE_LIMIT_WORKSPACE_ID', ['workspaceId'])
@Unique('UQ_USAGE_LIMIT_SCOPE', [
  'workspaceId',
  'resourceType',
  'operationType',
  'spenderType',
  'spenderId',
  'limitKind',
  'windowSeconds',
])
@Entity({ name: 'usageLimit', schema: 'core' })
@ObjectType('UsageLimit')
export class UsageLimitEntity extends WorkspaceRelatedEntity {
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ type: 'text' })
  resourceType: UsageResourceType;

  @Field(() => String)
  @Column({ type: 'text' })
  operationType: UsageOperationType;

  @Field(() => String)
  @Column({ type: 'text' })
  spenderType: SpenderType;

  // Empty string, not null: Postgres treats each null as distinct, so a null here
  // would let UQ_USAGE_LIMIT_SCOPE admit duplicate workspace-wide and all-of-type rules.
  @Field(() => String)
  @Column({ type: 'text', default: '' })
  spenderId: string;

  @Field(() => String)
  @Column({ type: 'text' })
  limitKind: LimitKind;

  @Field(() => Number)
  @Column({ type: 'int', default: 0 })
  windowSeconds: number;

  @Field(() => String)
  @Column({ type: 'text', default: 'absolute' })
  limitType: LimitValueType;

  @Field(() => Number)
  @Column({ type: 'bigint', transformer: bigintColumnTransformer })
  limitValue: number;

  @Field(() => Number, { nullable: true })
  @Column({
    type: 'bigint',
    nullable: true,
    transformer: bigintColumnTransformer,
  })
  burstValue: number | null;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
