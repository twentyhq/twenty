import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const WORKSPACE_ENTITY_CREATED_EVENT =
  'Workspace Entity Created' as const;
export const workspaceEntityCreatedSchema = z.strictObject({
  event: z.literal(WORKSPACE_ENTITY_CREATED_EVENT),
  properties: z.strictObject({
    name: z.string(),
  }),
});

export type WorkspaceEntityCreatedTrackEvent = z.infer<
  typeof workspaceEntityCreatedSchema
>;

registerEvent(WORKSPACE_ENTITY_CREATED_EVENT, workspaceEntityCreatedSchema);
