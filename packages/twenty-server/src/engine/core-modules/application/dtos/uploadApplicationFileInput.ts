import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class UploadApplicationFileInput {
  @Field(() => String)
  universalIdentifier: string;

  @Field(() => String)
  filePath: string;
}
