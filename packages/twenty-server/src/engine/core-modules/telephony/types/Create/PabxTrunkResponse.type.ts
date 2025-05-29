import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PabxTrunkResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
