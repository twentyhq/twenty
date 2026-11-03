import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AdminConsoleLoginToken')
export class AdminConsoleLoginTokenDTO {
  @Field(() => String)
  loginToken: string;

  @Field(() => String)
  adminConsoleUrl: string;
}
