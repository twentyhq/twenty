import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PabxDialingPlanResponseType {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
