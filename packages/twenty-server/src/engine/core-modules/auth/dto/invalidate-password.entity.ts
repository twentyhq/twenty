import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class InvalidatePassword {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}
