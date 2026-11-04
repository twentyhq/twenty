import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

export const WORKSPACE_DATA_EXPORT_REQUESTED_EVENT =
  'WorkspaceDataExportRequested' as const;

export const workspaceDataExportRequestedSchema = z.strictObject({
  event: z.literal(WORKSPACE_DATA_EXPORT_REQUESTED_EVENT),
  properties: z.strictObject({
    exportId: z.string(),
    actorUserId: z.string(),
  }),
});

export type WorkspaceDataExportRequestedTrackEvent = z.infer<
  typeof workspaceDataExportRequestedSchema
>;

registerEvent(
  WORKSPACE_DATA_EXPORT_REQUESTED_EVENT,
  workspaceDataExportRequestedSchema,
);
