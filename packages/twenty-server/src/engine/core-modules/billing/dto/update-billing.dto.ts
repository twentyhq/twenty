import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UpdateBillingDTO {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was successful',
  })
  success: boolean;
}
