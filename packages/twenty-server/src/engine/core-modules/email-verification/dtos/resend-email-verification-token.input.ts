import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ResendEmailVerificationTokenInput {
  @Field(() => String)
  email: string;
}
