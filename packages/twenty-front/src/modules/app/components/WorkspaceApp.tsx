import { RouterProvider } from 'react-router-dom';

import { useCreateWorkspaceAppRouter } from '@/app/hooks/useCreateWorkspaceAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const WorkspaceApp = () => {
  const isFunctionSettingsEnabled = false;

  const currentUser = useAtomStateValue(currentUserState);

  const isAdminPageEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) ??
    false;

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  return (
    <RouterProvider
      router={useCreateWorkspaceAppRouter({
        isFunctionSettingsEnabled,
        isAdminPageEnabled,
        isWorkflowCoreIndexPageEnabled,
      })}
    />
  );
};
