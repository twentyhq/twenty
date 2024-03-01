import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CheckoutEntity {
  @Field(() => String)
  url: string;
}
