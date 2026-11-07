import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsIn, ValidateIf } from 'class-validator';
import {
  DATA_RESIDENCY_REGIONS,
  type DataResidencyRegion,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

@InputType()
export class AiDataPolicyInput {
  @Field(() => String, { nullable: true })
  @IsIn([...DATA_RESIDENCY_REGIONS, null])
  requiredDataResidencyRegion: DataResidencyRegion | null;

  @Field(() => Boolean)
  @IsBoolean()
  isZeroDataRetentionRequired: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @ValidateIf(
    ({
      isProductImprovementDataSharingEnabled,
    }: Pick<AiDataPolicyInput, 'isProductImprovementDataSharingEnabled'>) =>
      isDefined(isProductImprovementDataSharingEnabled),
  )
  isProductImprovementDataSharingEnabled?: boolean;
}
