import { Field, Int, ObjectType } from '@nestjs/graphql';

import { GraphQLBigInt } from 'graphql-scalars';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type LimitValueType } from 'src/engine/core-modules/usage-limit/types/limit-value-type.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

// The entity stores the '' operation wildcard, which the UsageOperationType
// GraphQL enum cannot represent; the API exposes it as null instead.
@ObjectType('UsageLimit')
export class UsageLimitDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UsageResourceType)
  resourceType: UsageResourceType;

  @Field(() => UsageOperationType, { nullable: true })
  operationType: UsageOperationType | null;

  @Field(() => String)
  spenderType: SpenderType;

  @Field(() => String)
  spenderId: string;

  @Field(() => String)
  limitKind: LimitKind;

  @Field(() => Int)
  windowSeconds: number;

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
