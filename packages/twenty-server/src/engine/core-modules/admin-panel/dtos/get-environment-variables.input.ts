import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetEnvironmentVariablesInput {
  @Field(() => Boolean, { defaultValue: false })
  includeSensitive: boolean;
}
