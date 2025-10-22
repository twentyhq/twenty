import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UpdatePasswordOutput {
  @Field(() => Boolean, {
    description: 'Boolean that confirms query was dispatched',
  })
  success: boolean;
}
