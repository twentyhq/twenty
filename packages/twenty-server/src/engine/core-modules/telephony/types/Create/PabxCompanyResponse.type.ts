import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PabxCompanyResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
