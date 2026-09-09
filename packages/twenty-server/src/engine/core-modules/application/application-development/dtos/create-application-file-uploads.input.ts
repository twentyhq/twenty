import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { FileFolder } from 'twenty-shared/types';

import { MAX_APPLICATION_FILE_UPLOAD_BATCH_SIZE } from 'src/engine/core-modules/application/application-development/constants/application-development.constants';

@InputType()
export class ApplicationFileUploadRequestInput {
  @Field(() => FileFolder)
  fileFolder: FileFolder;

  @Field(() => String)
  filePath: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  size: number;
}

@ArgsType()
export class CreateApplicationFileUploadsInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsNotEmpty()
  applicationUniversalIdentifier?: string;

  @Field(() => [ApplicationFileUploadRequestInput])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_APPLICATION_FILE_UPLOAD_BATCH_SIZE)
  @ValidateNested({ each: true })
  @Type(() => ApplicationFileUploadRequestInput)
  files: ApplicationFileUploadRequestInput[];
}
