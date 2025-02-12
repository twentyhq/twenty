/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BillingUpdateOutput {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was successful',
  })
  success: boolean;
}
