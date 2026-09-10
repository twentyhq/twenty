import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';

@ObjectType('ApplicationFileCompletionError')
export class ApplicationFileCompletionErrorDTO {
  @Field(() => UUIDScalarType)
  fileId: string;

  @Field()
  message: string;
}

@ObjectType('CompleteApplicationFileUploadsResult')
export class CompleteApplicationFileUploadsResultDTO {
  @Field(() => [FileDTO])
  files: FileDTO[];

  @Field(() => [ApplicationFileCompletionErrorDTO])
  errors: ApplicationFileCompletionErrorDTO[];
}
