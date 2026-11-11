import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

export const isWorkspaceActive = (
  workspace: Pick<FlatWorkspace, 'activationStatus'> | null | undefined,
): boolean => workspace?.activationStatus === WorkspaceActivationStatus.ACTIVE;
