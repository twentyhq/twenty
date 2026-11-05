import { Field, ObjectType } from '@nestjs/graphql';

import { type AiDataResidencyPolicy } from 'twenty-shared/ai';

@ObjectType('AiDataPolicy')
export class AiDataPolicyDTO {
  @Field(() => String, { nullable: true })
  aiDataResidency: AiDataResidencyPolicy | null;

  @Field(() => Boolean)
  isAiZeroDataRetentionRequired: boolean;
}
