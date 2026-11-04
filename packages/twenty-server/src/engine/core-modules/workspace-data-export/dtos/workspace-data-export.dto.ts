import { Field, Float, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceDataExportObjectDTO } from 'src/engine/core-modules/workspace-data-export/dtos/workspace-data-export-object.dto';
import { WorkspaceDataExportStatus } from 'src/engine/core-modules/workspace-data-export/enums/workspace-data-export-status.enum';

@ObjectType('WorkspaceDataExport')
export class WorkspaceDataExportDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  workspaceId: string;

  @Field(() => WorkspaceDataExportStatus)
  status: WorkspaceDataExportStatus;

  @Field(() => Float)
  sizeInBytes: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => [WorkspaceDataExportObjectDTO])
  objects: WorkspaceDataExportObjectDTO[];

  @Field(() => String, { nullable: true })
  downloadUrl: string | null;
}
