/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingPartnerCode')
export class BillingPartnerCodeDTO {
  @Field(() => String, { nullable: true })
  partnerCode: string | null;

  @Field(() => Boolean, {
    description: 'False once the workspace has made its first payment',
  })
  isEditable: boolean;
}
