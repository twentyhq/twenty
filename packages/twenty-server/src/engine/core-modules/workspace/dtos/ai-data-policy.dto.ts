import { Field, ObjectType } from '@nestjs/graphql';

import {
  type AiDataPolicy,
  type AiDataResidencyPolicy,
} from 'twenty-shared/ai';

@ObjectType('AiDataPolicy')
export class AiDataPolicyDTO implements AiDataPolicy {
  @Field(() => String, { nullable: true })
  dataResidency: AiDataResidencyPolicy | null;

  @Field(() => Boolean)
  isZeroDataRetentionRequired: boolean;
}
