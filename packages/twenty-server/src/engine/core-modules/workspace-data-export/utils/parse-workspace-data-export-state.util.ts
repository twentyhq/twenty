import { FieldMetadataType } from 'twenty-shared/types';
import { z } from 'zod';

import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';

const workspaceDataExportStateSchema: z.ZodType<WorkspaceDataExportState> =
  z.object({
    workspaceName: z.string(),
    objects: z.array(
      z.object({
        objectMetadataId: z.string(),
        nameSingular: z.string(),
        labelSingular: z.string(),
        columns: z.array(
          z.object({
            fieldName: z.string(),
            label: z.string(),
            type: z.nativeEnum(FieldMetadataType),
            subFieldName: z.string().optional(),
          }),
        ),
        fieldCount: z.number(),
      }),
    ),
    partsByObject: z.record(
      z.string(),
      z.array(z.object({ name: z.string(), recordCount: z.number() })),
    ),
    completedObjectCount: z.number(),
    startedAt: z.number(),
    heartbeatAt: z.number(),
  });

export const parseWorkspaceDataExportState = (
  content: string,
):
  | { state: WorkspaceDataExportState; error?: undefined }
  | { state?: undefined; error: string } => {
  let json: unknown;

  try {
    json = JSON.parse(content);
  } catch (error) {
    return {
      error: `invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const result = workspaceDataExportStateSchema.safeParse(json);

  return result.success
    ? { state: result.data }
    : { error: result.error.message };
};
