import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SignedFileDTO {
  @Field(() => String)
  path: string;

  @Field(() => String)
  token: string;
}
