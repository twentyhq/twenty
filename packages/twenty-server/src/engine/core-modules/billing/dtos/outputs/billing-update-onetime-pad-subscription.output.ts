/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingUpdateOneTimePaidSubscriptionOutput {
  @Field(() => String, {
    description: 'The link for the bankslip file',
  })
  bankSlipFileLink: string;
}
