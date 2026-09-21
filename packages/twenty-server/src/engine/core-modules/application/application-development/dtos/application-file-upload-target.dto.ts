import { Field, ObjectType } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationFileUploadTarget')
export class ApplicationFileUploadTargetDTO {
  @Field(() => UUIDScalarType)
  fileId: string;

  @Field(() => FileFolder)
  fileFolder: FileFolder;

  @Field()
  filePath: string;

  @Field()
  uploadUrl: string;

  @Field()
  contentType: string;

  @Field(() => Date, { nullable: false })
  expiresAt: Date;
}
