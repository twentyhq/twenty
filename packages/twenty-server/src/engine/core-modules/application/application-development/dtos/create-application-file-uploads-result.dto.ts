import { Field, ObjectType } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';

import { ApplicationFileUploadTargetDTO } from 'src/engine/core-modules/application/application-development/dtos/application-file-upload-target.dto';

@ObjectType('ApplicationFileUploadError')
export class ApplicationFileUploadErrorDTO {
  @Field(() => FileFolder)
  fileFolder: FileFolder;

  @Field()
  filePath: string;

  @Field()
  message: string;
}

@ObjectType('CreateApplicationFileUploadsResult')
export class CreateApplicationFileUploadsResultDTO {
  @Field(() => [ApplicationFileUploadTargetDTO])
  targets: ApplicationFileUploadTargetDTO[];

  @Field(() => [ApplicationFileUploadErrorDTO])
  errors: ApplicationFileUploadErrorDTO[];
}
