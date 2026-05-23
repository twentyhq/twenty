import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('FileOutput')
export class FileOutputDTO {
  @Field(() => UUIDScalarType, { nullable: true })
  fileId: string | null;

  @Field({ nullable: true })
  label: string | null;

  @Field({ nullable: true })
  extension: string | null;

  @Field()
  url: string;
}
