import { Field, Int, ObjectType } from '@nestjs/graphql';

import { GraphQLBigInt } from 'graphql-scalars';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type LimitValueType } from 'src/engine/core-modules/usage-limit/types/limit-value-type.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@ObjectType('UsageLimit')
export class UsageLimitDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UsageResourceType)
  resourceType: UsageResourceType;

  @Field(() => UsageOperationType)
  operationType: UsageOperationType;

  @Field(() => String)
  spenderType: SpenderType;

  @Field(() => String, { nullable: true })
  spenderId: string | null;

  @Field(() => String)
  limitKind: LimitKind;

  @Field(() => Int)
  periodCount: number;

  @Field(() => String)
  periodUnit: PeriodUnit;

  @Field(() => String)
  meter: UsageMeter;

  @Field(() => String)
  limitValueType: LimitValueType;

  @Field(() => GraphQLBigInt)
  limitValue: number;

  @Field(() => GraphQLBigInt, { nullable: true })
  burstValue: number | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
