import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsIn } from 'class-validator';
import {
  AI_DATA_RESIDENCY_POLICIES,
  type AiDataPolicy,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

@InputType()
export class AiDataPolicyInput implements AiDataPolicy {
  @Field(() => String, { nullable: true })
  @IsIn([...AI_DATA_RESIDENCY_POLICIES, null])
  dataResidency: AiDataResidencyPolicy | null;

  @Field(() => Boolean)
  @IsBoolean()
  isZeroDataRetentionRequired: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  isProductImprovementDataSharingEnabled: boolean;
}
