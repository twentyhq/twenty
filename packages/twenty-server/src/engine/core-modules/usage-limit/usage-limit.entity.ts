import { Field, Int, ObjectType } from '@nestjs/graphql';

import { GraphQLBigInt } from 'graphql-scalars';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type LimitValueType } from 'src/engine/core-modules/usage-limit/types/limit-value-type.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { nullableBigintColumnTransformer } from 'src/engine/core-modules/usage-limit/utils/nullable-bigint-column-transformer.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

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

  @Field(() => UsageResourceType)
  @Column({ type: 'varchar' })
  resourceType: UsageResourceType;

  @Field(() => UsageOperationType)
  @Column({ type: 'varchar' })
  operationType: UsageOperationType;

  @Field(() => String)
  @Column({ type: 'varchar' })
  spenderType: SpenderType;

  @Field(() => String)
  @Column({ type: 'varchar', default: '' })
  spenderId: string;

  @Field(() => String)
  @Column({ type: 'varchar' })
  limitKind: LimitKind;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  windowSeconds: number;

  @Field(() => String)
  @Column({ type: 'varchar', default: 'absolute' })
  limitValueType: LimitValueType;

  @Field(() => GraphQLBigInt)
  @Column({ type: 'bigint', transformer: nullableBigintColumnTransformer })
  limitValue: number;

  @Field(() => GraphQLBigInt, { nullable: true })
  @Column({
    type: 'bigint',
    nullable: true,
    transformer: nullableBigintColumnTransformer,
  })
  burstValue: number | null;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
