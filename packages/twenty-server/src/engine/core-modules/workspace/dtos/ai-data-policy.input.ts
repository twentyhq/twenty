import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsIn } from 'class-validator';
import {
  AI_DATA_RESIDENCY_POLICIES,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

@InputType()
export class AiDataPolicyInput {
  @Field(() => String, { nullable: true })
  @IsIn([...AI_DATA_RESIDENCY_POLICIES, null])
  aiDataResidency: AiDataResidencyPolicy | null;

  @Field(() => Boolean)
  @IsBoolean()
  isAiZeroDataRetentionRequired: boolean;
}
