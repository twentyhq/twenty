import { ArgsType, Field } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';

@ArgsType()
export class UploadApplicationFileInput {
  @Field(() => String)
  universalIdentifier: string;

  @Field(() => FileFolder)
  fileFolder: FileFolder;

  @Field(() => String)
  filePath: string;
}
