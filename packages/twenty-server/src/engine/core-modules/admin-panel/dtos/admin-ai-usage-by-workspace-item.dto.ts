import { Field, Float, ObjectType } from '@nestjs/graphql';

import { UsageBreakdownItemDTO } from 'src/engine/core-modules/usage/dtos/usage-breakdown-item.dto';

@ObjectType('AdminAiUsageByWorkspaceItem')
export class AdminAiUsageByWorkspaceItemDTO extends UsageBreakdownItemDTO {
  @Field(() => Float)
  includedCreditsUsed: number;
}
