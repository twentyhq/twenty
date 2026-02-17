import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('FileWithSignedUrl')
export class FileWithSignedUrlDto {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  path: string;

  @Field()
  size: number;

  @Field(() => Date, { nullable: false })
  createdAt: Date;

  @Field()
  url: string;
}
