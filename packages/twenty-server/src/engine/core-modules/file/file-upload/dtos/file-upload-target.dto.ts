import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('FileUploadTarget')
export class FileUploadTargetDTO {
  @Field(() => UUIDScalarType)
  fileId: string;

  @Field()
  uploadUrl: string;

  // Content-Type header the client must send when uploading to uploadUrl
  @Field()
  contentType: string;

  @Field(() => Date, { nullable: false })
  expiresAt: Date;
}
