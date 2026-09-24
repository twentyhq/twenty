import { Field, Int, ObjectType } from '@nestjs/graphql';

import { GraphQLBigInt } from 'graphql-scalars';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UsageLimitDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit.dto';
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

  @Field(() => Boolean)
  isOverridable: boolean;

  @Field(() => UUIDScalarType, { nullable: true })
  overriddenByUsageLimitId: string | null;
}

@ObjectType('AdminPanelUsageLimit')
export class AdminPanelUsageLimitDTO extends UsageLimitDTO {
  @Field(() => Boolean)
  isEnforcedOnCurrentPlan: boolean;
}

@ObjectType('AdminPanelWorkspaceUsageLimits')
export class AdminPanelWorkspaceUsageLimitsDTO {
  @Field(() => [AdminPanelUsageLimitDefaultDTO])
  defaults: AdminPanelUsageLimitDefaultDTO[];

  @Field(() => [AdminPanelUsageLimitDTO])
  limits: AdminPanelUsageLimitDTO[];
}
