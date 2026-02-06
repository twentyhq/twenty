import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('FilesFieldFile')
export class FilesFieldFileDTO {
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
