import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsIn } from 'class-validator';
import {
  DATA_RESIDENCIES_BY_AI_DATA_RESIDENCY_POLICY,
  type AiDataPolicy,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

@InputType()
export class AiDataPolicyInput implements AiDataPolicy {
  @Field(() => String, { nullable: true })
  @IsIn([...Object.keys(DATA_RESIDENCIES_BY_AI_DATA_RESIDENCY_POLICY), null])
  dataResidency: AiDataResidencyPolicy | null;

  @Field(() => Boolean)
  @IsBoolean()
  isZeroDataRetentionRequired: boolean;
}
