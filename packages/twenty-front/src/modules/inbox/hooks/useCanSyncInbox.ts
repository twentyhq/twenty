import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanSyncInbox = () => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  return hasAiPermission && !isWorkspaceSuspended;
};
