import { Field, ObjectType } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationFileUploadTarget')
export class ApplicationFileUploadTargetDTO {
  @Field(() => UUIDScalarType)
  fileId: string;

  // fileFolder and filePath are echoed back so the client can pair a target
  // with the local file it requested it for, without relying on array order.
  @Field(() => FileFolder)
  fileFolder: FileFolder;

  @Field()
  filePath: string;

  @Field()
  uploadUrl: string;

  // Content-Type header the client must send when uploading to uploadUrl
  @Field()
  contentType: string;

  @Field(() => Date, { nullable: false })
  expiresAt: Date;
}
