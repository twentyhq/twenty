/* @license Enterprise */

import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CustomAiProviderAccessDTO {
  @Field(() => Boolean)
  hasAccess: boolean;

  @Field(() => Int)
  seatCount: number;

  @Field(() => Int)
  seatThreshold: number;
}
