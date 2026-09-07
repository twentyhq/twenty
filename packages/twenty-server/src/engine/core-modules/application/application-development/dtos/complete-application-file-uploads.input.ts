import { ArgsType, Field } from '@nestjs/graphql';

import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MAX_APPLICATION_FILE_UPLOAD_BATCH_SIZE } from 'src/engine/core-modules/application/application-development/constants/application-development.constants';

@ArgsType()
export class CompleteApplicationFileUploadsInput {
  @Field(() => String)
  @IsNotEmpty()
  applicationUniversalIdentifier: string;

  @Field(() => [UUIDScalarType])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_APPLICATION_FILE_UPLOAD_BATCH_SIZE)
  fileIds: string[];
}
