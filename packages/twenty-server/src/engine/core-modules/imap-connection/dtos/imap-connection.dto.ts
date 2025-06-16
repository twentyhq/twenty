import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ImapConnectionParams {
  @Field(() => String)
  handle: string;

  @Field(() => String)
  host: string;

  @Field(() => Number)
  port: number;

  @Field(() => String)
  password: string;

  @Field(() => Boolean)
  secure: boolean;
}
