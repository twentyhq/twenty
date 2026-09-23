import { Field, Int, ObjectType } from '@nestjs/graphql';

import { GraphQLBigInt } from 'graphql-scalars';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@ObjectType('AdminPanelUsageLimitDefault')
export class AdminPanelUsageLimitDefaultDTO {
  @Field(() => UsageResourceType)
  resourceType: UsageResourceType;

  @Field(() => UsageOperationType)
  operationType: UsageOperationType;

  @Field(() => String)
  spenderType: SpenderType;

  @Field(() => String)
  limitKind: LimitKind;

  @Field(() => Int)
  periodCount: number;

  @Field(() => String)
  periodUnit: PeriodUnit;

  @Field(() => String)
  meter: UsageMeter;

  @Field(() => GraphQLBigInt)
  limitValue: number;

  @Field(() => String)
  limitValueConfigVariable: string;

  @Field(() => String, { nullable: true })
  windowMsConfigVariable: string | null;

  @Field(() => String, { nullable: true })
  counterScope: string | null;

  @Field(() => Boolean)
  isOverridable: boolean;

  @Field(() => Boolean)
  isEnforcedOnCurrentPlan: boolean;

  @Field(() => UUIDScalarType, { nullable: true })
  overriddenByUsageLimitId: string | null;
}

@ObjectType('AdminPanelUsageLimit')
export class AdminPanelUsageLimitDTO {
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

  @Field(() => GraphQLBigInt)
  limitValue: number;

  @Field(() => GraphQLBigInt, { nullable: true })
  burstValue: number | null;

  @Field(() => Boolean)
  isEnforcedOnCurrentPlan: boolean;

  @Field(() => Boolean)
  suppressesDefault: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType('AdminPanelWorkspaceUsageLimits')
export class AdminPanelWorkspaceUsageLimitsDTO {
  @Field(() => [AdminPanelUsageLimitDefaultDTO])
  defaults: AdminPanelUsageLimitDefaultDTO[];

  @Field(() => [AdminPanelUsageLimitDTO])
  limits: AdminPanelUsageLimitDTO[];
}
