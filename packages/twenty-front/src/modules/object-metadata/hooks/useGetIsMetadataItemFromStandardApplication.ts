import { useCallback } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getIsMetadataItemFromStandardApplication } from '@/object-metadata/utils/getIsMetadataItemFromStandardApplication';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useGetIsMetadataItemFromStandardApplication = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const applications = currentWorkspace?.installedApplications;

  return useCallback(
    (metadataItem: { applicationId?: string | null }) =>
      getIsMetadataItemFromStandardApplication(
        metadataItem,
        applications ?? [],
      ),
    [applications],
  );
};
