import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UpdateRoutingRulesResponseType {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
