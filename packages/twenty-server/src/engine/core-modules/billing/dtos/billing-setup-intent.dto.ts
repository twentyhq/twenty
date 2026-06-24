/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingSetupIntent')
export class BillingSetupIntentDTO {
  @Field(() => String)
  clientSecret: string;
}
