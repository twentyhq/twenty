import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('File')
export class FileDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  name: string;

  @Field()
  fullPath: string;

  @Field()
  size: number;

  @Field()
  type: string;

  @Field(() => Date, { nullable: false })
  createdAt: Date;
}
