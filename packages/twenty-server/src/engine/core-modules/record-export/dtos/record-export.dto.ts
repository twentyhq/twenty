import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';

@ObjectType('RecordExport')
export class RecordExportDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  workspaceId: string;

  @Field(() => UUIDScalarType)
  workspaceMemberId: string;

  @Field(() => String)
  filename: string;

  @Field(() => RecordExportStatus)
  status: RecordExportStatus;

  @Field(() => Int)
  processedRecordCount: number;

  @Field(() => String, { nullable: true })
  errorMessage: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date)
  expiresAt: Date;
}
