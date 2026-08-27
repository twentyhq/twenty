import { type ApplicationBroadcastRecord } from '@/applications/types/ApplicationBroadcastRecord';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FindManyApplicationsDocument } from '~/generated-metadata/graphql';

// Keeps the applications Apollo cache and the workspace installedApplications
// list in sync with SSE broadcast events so install/upgrade/uninstall state
// changes are visible without a reload.
export const useListenToApplicationEvents = ({
  skip = false,
}: {
  skip?: boolean;
} = {}) => {
  const apolloClient = useApolloClient();
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);

  const applyApplicationEventToApolloCache = useCallback(
    (
      detail: MetadataOperationBrowserEventDetail<ApplicationBroadcastRecord>,
    ) => {
      if (detail.operation.type === 'update') {
        const { updatedRecord } = detail.operation;

        const cacheId = apolloClient.cache.identify({
          __typename: 'Application',
          id: updatedRecord.id,
        });

        if (!isDefined(cacheId)) {
          return;
        }

        apolloClient.cache.modify({
          id: cacheId,
          fields: {
            state: (existingState) => updatedRecord.state ?? existingState,
            version: (existingVersion) =>
              updatedRecord.version !== undefined
                ? updatedRecord.version
                : existingVersion,
            name: (existingName) => updatedRecord.name ?? existingName,
          },
        });

        return;
      }

      if (detail.operation.type === 'delete') {
        const { deletedRecordId } = detail.operation;

        apolloClient.cache.evict({
          id: apolloClient.cache.identify({
            __typename: 'Application',
            id: deletedRecordId,
          }),
        });
        apolloClient.cache.gc();

        // The workspace carries the applications app chips resolve their
        // logo from; drop the uninstalled one so no stale chip remains.
        setCurrentWorkspace((currentWorkspace) =>
          isDefined(currentWorkspace)
            ? {
                ...currentWorkspace,
                installedApplications:
                  currentWorkspace.installedApplications.filter(
                    (installedApplication) =>
                      installedApplication.id !== deletedRecordId,
                  ),
              }
            : currentWorkspace,
        );
      }

      // Creations and deletions change the list membership.
      void apolloClient.query({
        query: FindManyApplicationsDocument,
        fetchPolicy: 'network-only',
      });
    },
    [apolloClient, setCurrentWorkspace],
  );

  useListenToMetadataOperationBrowserEvent<ApplicationBroadcastRecord>({
    metadataName: 'application',
    onMetadataOperationBrowserEvent: applyApplicationEventToApolloCache,
    skip,
  });
};
