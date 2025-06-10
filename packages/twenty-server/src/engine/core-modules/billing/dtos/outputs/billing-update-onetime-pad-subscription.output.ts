/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingUpdateOneTimePaidSubscriptionOutput {
  @Field(() => String, {
    description: 'The url for the bankslip file',
  })
  bankSlipFileUrl: string;
}
