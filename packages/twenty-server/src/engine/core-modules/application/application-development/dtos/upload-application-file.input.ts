import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty } from 'class-validator';
import { IsSafeRelativePath } from 'src/engine/core-modules/file-storage/validators/is-safe-relative-path.validator';
import { FileFolder } from 'twenty-shared/types';

@ArgsType()
export class UploadApplicationFileInput {
  @Field(() => String)
  @IsNotEmpty()
  applicationUniversalIdentifier: string;

  @Field(() => FileFolder)
  fileFolder: FileFolder;

  @Field(() => String)
  @IsNotEmpty()
  @IsSafeRelativePath()
  filePath: string;
}
