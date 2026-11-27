import { workspaceInstalledApplicationsVersionState } from '@/applications/states/workspaceInstalledApplicationsRefreshState';
import { useRefreshWorkspaceInstalledApplications } from '@/applications/hooks/useRefreshWorkspaceInstalledApplications';
import { hasInstalledApplications } from '@/applications/utils/hasInstalledApplications';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { getSessionGeneration } from '@/auth/utils/getSessionGeneration';
import { toFrontComponentObjectMetadata } from '@/front-components/utils/toFrontComponentObjectMetadata';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { objectMetadataItemsByNameSingularMapSelector } from '@/object-metadata/states/objectMetadataItemsByNameSingularMapSelector';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { type GetObjectMetadataFunction } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';

export const useGetFrontComponentObjectMetadata = (
  applicationId: string | undefined,
) => {
  const store = useStore();
  const [sessionGeneration] = useState(getSessionGeneration);
  const refreshWorkspaceInstalledApplications =
    useRefreshWorkspaceInstalledApplications();

  return useCallback<GetObjectMetadataFunction>(
    async (objectNameSingular) => {
      const workspaceId = store.get(currentWorkspaceState.atom)?.id;
      const version = store.get(
        workspaceInstalledApplicationsVersionState.atom,
      );
      const getObjectMetadata = () =>
        store
          .get(objectMetadataItemsByNameSingularMapSelector.atom)
          .get(objectNameSingular);
      const ownerApplicationId = getObjectMetadata()?.applicationId;

      if (
        !isDefined(workspaceId) ||
        !isDefined(applicationId) ||
        !isDefined(ownerApplicationId) ||
        getSessionGeneration() !== sessionGeneration
      ) {
        return null;
      }

      const requiredApplicationIds = [applicationId, ownerApplicationId];
      const refreshed = await refreshWorkspaceInstalledApplications(
        requiredApplicationIds,
      );
      const workspace = store.get(currentWorkspaceState.atom);
      const objectMetadata = getObjectMetadata();

      if (
        !refreshed ||
        !store.get(isCookieAuthActiveState.atom) ||
        workspace?.id !== workspaceId ||
        getSessionGeneration() !== sessionGeneration ||
        store.get(workspaceInstalledApplicationsVersionState.atom) !==
          version ||
        store.get(metadataStoreState.atomFamily('fieldMetadataItems'))
          .status !== 'up-to-date' ||
        objectMetadata?.applicationId !== ownerApplicationId ||
        !hasInstalledApplications(workspace, requiredApplicationIds)
      ) {
        return null;
      }

      return toFrontComponentObjectMetadata(objectMetadata);
    },
    [
      applicationId,
      refreshWorkspaceInstalledApplications,
      sessionGeneration,
      store,
    ],
  );
};
