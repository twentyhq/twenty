import { z } from 'zod';

import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';

const workspaceDataExportStateSchema: z.ZodType<WorkspaceDataExportState> =
  z.object({
    workspaceName: z.string(),
    tables: z.array(
      z.object({
        nameSingular: z.string(),
        labelSingular: z.string(),
        tableName: z.string(),
        fieldCount: z.number(),
        columns: z.array(z.object({ name: z.string(), isText: z.boolean() })),
      }),
    ),
    partsByTable: z.record(
      z.string(),
      z.array(z.object({ name: z.string(), recordCount: z.number() })),
    ),
    completedTableCount: z.number(),
    startedAt: z.number(),
    heartbeatAt: z.number(),
  });

export const parseWorkspaceDataExportState = (
  content: string,
): WorkspaceDataExportState | undefined => {
  try {
    return workspaceDataExportStateSchema.parse(JSON.parse(content));
  } catch {
    return undefined;
  }
};
