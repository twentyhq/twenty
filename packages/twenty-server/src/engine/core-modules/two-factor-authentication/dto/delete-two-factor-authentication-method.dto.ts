import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('DeleteTwoFactorAuthenticationMethod')
export class DeleteTwoFactorAuthenticationMethodDTO {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}
