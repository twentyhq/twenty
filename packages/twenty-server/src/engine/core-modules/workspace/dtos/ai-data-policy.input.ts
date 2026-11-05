import { Field, InputType } from '@nestjs/graphql';

import { isUndefined } from '@sniptt/guards';
import { IsBoolean, IsIn, ValidateIf } from 'class-validator';
import {
  AI_DATA_RESIDENCY_POLICIES,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

@InputType()
export class AiDataPolicyInput {
  @Field(() => String, { nullable: true })
  @IsIn([...AI_DATA_RESIDENCY_POLICIES, null])
  dataResidency: AiDataResidencyPolicy | null;

  @Field(() => Boolean)
  @IsBoolean()
  isZeroDataRetentionRequired: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @ValidateIf(
    ({
      isProductImprovementDataSharingEnabled,
    }: Pick<AiDataPolicyInput, 'isProductImprovementDataSharingEnabled'>) =>
      !isUndefined(isProductImprovementDataSharingEnabled),
  )
  isProductImprovementDataSharingEnabled?: boolean;
}
