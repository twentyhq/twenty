import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CreateDevelopmentApplicationInput {
  @Field(() => String)
  universalIdentifier: string;

  @Field(() => String)
  name: string;
}
