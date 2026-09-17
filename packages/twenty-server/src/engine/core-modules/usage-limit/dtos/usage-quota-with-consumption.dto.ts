import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLBigInt } from 'graphql-scalars';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@ObjectType('UsageQuotaWithConsumption')
export class UsageQuotaWithConsumptionDTO {
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

  @Field(() => String, { nullable: true })
  spenderLabel: string | null;

  @Field(() => String)
  periodUnit: PeriodUnit;

  @Field(() => String)
  meter: UsageMeter;

  @Field(() => GraphQLBigInt)
  limitValue: number;

  @Field(() => Boolean)
  isEnforced: boolean;

  @Field(() => GraphQLBigInt, { nullable: true })
  consumedValue: number | null;

  @Field(() => GraphQLBigInt, { nullable: true })
  remainingValue: number | null;

  @Field(() => Date, { nullable: true })
  periodStart: Date | null;

  @Field(() => Date, { nullable: true })
  periodEnd: Date | null;
}
