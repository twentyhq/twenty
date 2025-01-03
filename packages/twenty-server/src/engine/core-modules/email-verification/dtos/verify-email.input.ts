import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class VerifyEmailInput {
  @Field(() => String)
  emailVerificationToken: string;
}
