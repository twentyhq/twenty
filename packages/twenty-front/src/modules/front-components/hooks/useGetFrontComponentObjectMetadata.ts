import { applicationBroadcastEventCountState } from '@/applications/states/applicationBroadcastEventCountState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { getSessionGeneration } from '@/auth/utils/getSessionGeneration';
import { frontComponentWorkspaceApplicationsState } from '@/front-components/states/frontComponentWorkspaceApplicationsState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { objectMetadataItemsByNameSingularMapSelector } from '@/object-metadata/states/objectMetadataItemsByNameSingularMapSelector';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { type GetObjectMetadataFunction } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';
import { GetFrontComponentWorkspaceApplicationsDocument } from '~/generated-metadata/graphql';

export const useGetFrontComponentObjectMetadata = (
  applicationId: string | undefined,
) => {
  const client = useApolloClient();
  const store = useStore();
  const [sessionGeneration] = useState(getSessionGeneration);

  return useCallback<GetObjectMetadataFunction>(
    async (objectNameSingular) => {
      const workspace = store.get(currentWorkspaceState.atom);

      if (
        !store.get(isCookieAuthActiveState.atom) ||
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

      if (!isDefined(object?.applicationId)) {
        return null;
      }

      const eventCount = store.get(applicationBroadcastEventCountState.atom);
      let scope = store.get(frontComponentWorkspaceApplicationsState.atom);
      const bootstrapIncludes = (id: string) =>
        workspace.installedApplications.some((app) => app.id === id);

      // The bootstrap list can predate an install or removal in another session.
      if (
        isDefined(scope) ||
        eventCount > 0 ||
        !store.get(isCurrentUserLoadedState.atom) ||
        !bootstrapIncludes(applicationId) ||
        !bootstrapIncludes(object.applicationId)
      ) {
        if (
          scope?.workspaceId !== workspace.id ||
          scope.sessionGeneration !== sessionGeneration ||
          scope.eventCount !== eventCount ||
          scope.bootstrapApplications !== workspace.installedApplications
        ) {
          const ids = client
            .query({
              query: GetFrontComponentWorkspaceApplicationsDocument,
              fetchPolicy: 'no-cache',
              context: { queryDeduplication: false },
            })
            .then(({ data }) =>
              data?.currentWorkspace.id === workspace.id
                ? new Set(
                    data.currentWorkspace.installedApplications.map(
                      ({ id }) => id,
                    ),
                  )
                : null,
            )
            .catch(() => null);
          scope = {
            workspaceId: workspace.id,
            sessionGeneration,
            eventCount,
            bootstrapApplications: workspace.installedApplications,
            ids,
          };
          store.set(frontComponentWorkspaceApplicationsState.atom, scope);
        }

        const ids = await scope.ids;

        if (
          !isDefined(ids) &&
          store.get(frontComponentWorkspaceApplicationsState.atom) === scope
        ) {
          store.set(frontComponentWorkspaceApplicationsState.atom, null);
        }

        if (
          !ids?.has(applicationId) ||
          !ids.has(object.applicationId) ||
          !store.get(isCookieAuthActiveState.atom) ||
          store.get(currentWorkspaceState.atom)?.id !== workspace.id ||
          getSessionGeneration() !== sessionGeneration ||
          store.get(applicationBroadcastEventCountState.atom) !== eventCount
        ) {
          return null;
        }
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
    [applicationId, client, sessionGeneration, store],
  );
};
