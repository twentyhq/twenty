import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('UpdatePassword')
export class UpdatePasswordDTO {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}
