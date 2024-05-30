import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class KeyValuePairCreated {
  @Field(() => Boolean, {
    description: 'Boolean that Key Value Pair has been created',
  })
  success: boolean;
}
