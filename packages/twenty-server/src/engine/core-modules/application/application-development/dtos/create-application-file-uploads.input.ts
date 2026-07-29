import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { APPLICATION_FILE_UPLOAD_BATCH_SIZE } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { IsSafeRelativePath } from 'src/engine/core-modules/file-storage/validators/is-safe-relative-path.validator';

@InputType()
export class ApplicationFileUploadRequestInput {
  @Field(() => FileFolder)
  fileFolder: FileFolder;

  @Field(() => String)
  @IsNotEmpty()
  @IsSafeRelativePath()
  filePath: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  size: number;
}

@ArgsType()
export class CreateApplicationFileUploadsInput {
  @Field(() => String)
  @IsNotEmpty()
  applicationUniversalIdentifier: string;

  @Field(() => [ApplicationFileUploadRequestInput])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(APPLICATION_FILE_UPLOAD_BATCH_SIZE)
  @ValidateNested({ each: true })
  @Type(() => ApplicationFileUploadRequestInput)
  files: ApplicationFileUploadRequestInput[];
}
