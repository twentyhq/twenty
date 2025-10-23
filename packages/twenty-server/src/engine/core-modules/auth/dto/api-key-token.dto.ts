import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ApiKeyToken {
  @Field(() => String)
  token: string;
}
