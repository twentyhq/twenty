import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const WORKSPACE_CREATED_EVENT = 'Workspace Created' as const;
export const workspaceCreatedSchema = z.strictObject({
  event: z.literal(WORKSPACE_CREATED_EVENT),
  properties: z.strictObject({}),
});

export type WorkspaceCreatedTrackEvent = z.infer<typeof workspaceCreatedSchema>;

registerEvent(WORKSPACE_CREATED_EVENT, workspaceCreatedSchema);
