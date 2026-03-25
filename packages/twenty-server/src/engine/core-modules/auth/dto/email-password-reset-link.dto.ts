import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('EmailPasswordResetLink')
export class EmailPasswordResetLinkDTO {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}
