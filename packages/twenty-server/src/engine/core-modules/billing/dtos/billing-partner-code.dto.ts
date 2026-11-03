/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingPartnerCode')
export class BillingPartnerCodeDTO {
  @Field(() => String, { nullable: true })
  partnerCode: string | null;

  @Field(() => Boolean, {
    description: 'True while no code is set and the workspace has not paid yet',
  })
  isEditable: boolean;
}
