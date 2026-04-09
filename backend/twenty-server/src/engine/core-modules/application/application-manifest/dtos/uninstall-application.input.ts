import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class UninstallApplicationInput {
  @Field(() => String)
  universalIdentifier: string;
}
