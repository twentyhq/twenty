import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_DATA_EXPORT_STALE_AFTER_MS } from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';

export const isWorkspaceDataExportStale = (
  state: Pick<WorkspaceDataExportState, 'heartbeatAt'> | undefined,
): boolean =>
  !isDefined(state) ||
  Date.now() - state.heartbeatAt > WORKSPACE_DATA_EXPORT_STALE_AFTER_MS;
