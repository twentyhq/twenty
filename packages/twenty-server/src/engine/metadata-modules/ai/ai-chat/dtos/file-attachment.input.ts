import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class FileAttachmentInput {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  filename: string;
}
