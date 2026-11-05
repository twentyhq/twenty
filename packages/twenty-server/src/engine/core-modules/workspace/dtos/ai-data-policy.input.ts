import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsIn } from 'class-validator';
import {
  MODEL_RESIDENCIES_ALLOWED_BY_POLICY,
  type AiDataPolicy,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

@InputType()
export class AiDataPolicyInput implements AiDataPolicy {
  @Field(() => String, { nullable: true })
  @IsIn([...Object.keys(MODEL_RESIDENCIES_ALLOWED_BY_POLICY), null])
  dataResidency: AiDataResidencyPolicy | null;

  @Field(() => Boolean)
  @IsBoolean()
  isZeroDataRetentionRequired: boolean;
}
