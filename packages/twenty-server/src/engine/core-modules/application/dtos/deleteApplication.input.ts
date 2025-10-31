import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class DeleteApplicationInput {
  @Field(() => String)
  universalIdentifier: string;
}
