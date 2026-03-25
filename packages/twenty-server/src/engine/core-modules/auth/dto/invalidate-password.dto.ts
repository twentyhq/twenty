import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('InvalidatePassword')
export class InvalidatePasswordDTO {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}
