/* @license Enterprise */

import { Field, Float, ObjectType } from '@nestjs/graphql';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@ObjectType('CreditUsedItem')
export class CreditUsedItemDTO {
  @Field(() => UsageResourceType, { nullable: true })
  resource?: UsageResourceType | null;

  @Field(() => UsageOperationType, { nullable: true })
  operation?: UsageOperationType | null;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => Float)
  creditsUsed: number;
}
