import { Field, ObjectType } from '@nestjs/graphql';

import { UsageQuotaDefinitionDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-definition.dto';

@ObjectType('UsageQuotaDefinitions')
export class UsageQuotaDefinitionsDTO {
  @Field(() => [UsageQuotaDefinitionDTO])
  definitions: UsageQuotaDefinitionDTO[];

  @Field(() => Boolean)
  isIntraWorkspaceLimitEntitled: boolean;

  @Field(() => Boolean)
  hasAllowancePeriod: boolean;
}
