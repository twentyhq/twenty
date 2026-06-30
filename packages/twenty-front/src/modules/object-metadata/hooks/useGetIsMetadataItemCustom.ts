import { useCallback } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useGetIsMetadataItemCustom = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const workspaceCustomApplicationId =
    currentWorkspace?.workspaceCustomApplication?.id;

  return useCallback(
    (metadataItem: { applicationId?: string | null }) =>
      getIsMetadataItemCustom(metadataItem, workspaceCustomApplicationId),
    [workspaceCustomApplicationId],
  );
};
