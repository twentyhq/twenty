import { ArgsType, Field } from '@nestjs/graphql';

import { APPLICATION_FILE_UPLOAD_BATCH_SIZE } from 'twenty-shared/application';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class CompleteApplicationFileUploadsInput {
  @Field(() => String)
  @IsNotEmpty()
  applicationUniversalIdentifier: string;

  @Field(() => [UUIDScalarType])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(APPLICATION_FILE_UPLOAD_BATCH_SIZE)
  fileIds: string[];
}
