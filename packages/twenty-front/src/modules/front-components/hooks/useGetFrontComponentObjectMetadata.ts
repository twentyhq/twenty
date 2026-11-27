import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { getSessionGeneration } from '@/auth/utils/getSessionGeneration';
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

  return useCallback<GetObjectMetadataFunction>(
    async (objectNameSingular) => {
      const workspace = store.get(currentWorkspaceState.atom);

      if (
        !store.get(isCookieAuthActiveState.atom) ||
        !store.get(isCurrentUserLoadedState.atom) ||
        !isDefined(workspace) ||
        !isDefined(applicationId) ||
        getSessionGeneration() !== sessionGeneration ||
        store.get(metadataStoreState.atomFamily('fieldMetadataItems'))
          .status !== 'up-to-date'
      ) {
        return null;
      }

      const object = store
        .get(objectMetadataItemsByNameSingularMapSelector.atom)
        .get(objectNameSingular);

      // IndexedDB may still contain a previous workspace's schema during startup.
      const installedApplicationIds = new Set(
        workspace.installedApplications.map(({ id }) => id),
      );
      if (
        !installedApplicationIds.has(applicationId) ||
        !isDefined(object?.applicationId) ||
        !installedApplicationIds.has(object.applicationId)
      ) {
        return null;
      }

      return {
        id: object.id,
        nameSingular: object.nameSingular,
        namePlural: object.namePlural,
        labelSingular: object.labelSingular,
        labelPlural: object.labelPlural,
        fields: object.fields.map(({ id, name, label, type, options }) => ({
          id,
          name,
          label,
          type,
          options:
            options?.map(({ value, label, color, position }) => ({
              value,
              label,
              color,
              position,
            })) ?? null,
        })),
      };
    },
    [applicationId, sessionGeneration, store],
  );
};
