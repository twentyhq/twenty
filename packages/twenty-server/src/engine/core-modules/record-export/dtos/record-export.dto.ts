import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RecordExport')
export class RecordExportDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  filename: string;

  @Field(() => Int)
  progress: number;

  @Field(() => String, { nullable: true })
  errorMessage: string | null;

  @Field(() => String, { nullable: true })
  downloadUrl?: string;
}
