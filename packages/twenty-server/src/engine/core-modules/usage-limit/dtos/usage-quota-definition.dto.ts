import { Field, ObjectType } from '@nestjs/graphql';

import { UsageLimitOperationDefinitionDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit-operation-definition.dto';
import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

@ObjectType('UsageQuotaDefinition')
export class UsageQuotaDefinitionDTO {
  @Field(() => UsageResourceType)
  resourceType: UsageResourceType;

  @Field(() => String)
  limitKind: LimitKind;

  @Field(() => [UsageLimitOperationDefinitionDTO])
  allowedOperations: UsageLimitOperationDefinitionDTO[];

  @Field(() => [String])
  allowedSpenderTypes: SpenderType[];
}
