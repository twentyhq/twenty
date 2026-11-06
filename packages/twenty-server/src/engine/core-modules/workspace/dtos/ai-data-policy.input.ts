import { Field, InputType } from '@nestjs/graphql';

import { isUndefined } from '@sniptt/guards';
import { IsBoolean, IsIn, ValidateIf } from 'class-validator';
import {
  DATA_RESIDENCY_REGIONS,
  type DataResidencyRegion,
} from 'twenty-shared/ai';

@InputType()
export class AiDataPolicyInput {
  @Field(() => String, { nullable: true })
  @IsIn([...DATA_RESIDENCY_REGIONS, null])
  requiredDataResidency: DataResidencyRegion | null;

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
