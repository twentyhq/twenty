import { WORKSPACE_LOCAL_STATE_PROPERTIES } from 'src/engine/metadata-modules/overrides/constants/workspace-local-state-properties.constant';

export const APPLICATION_SYNC_LOCAL_STATE_PROPERTIES: ReadonlySet<string> =
  new Set([...WORKSPACE_LOCAL_STATE_PROPERTIES, 'isPrivate']);
