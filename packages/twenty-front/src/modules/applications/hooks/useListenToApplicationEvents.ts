import { type ApplicationBroadcastRecord } from '@/applications/types/ApplicationBroadcastRecord';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  ApplicationState,
  FindManyApplicationsDocument,
  FindOneApplicationByUniversalIdentifierDocument,
  FindOneApplicationDocument,
  FindOneApplicationSummaryDocument,
} from '~/generated-metadata/graphql';

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

  // Broadcast events only carry the application row, never its relations
  // (roles, objects, logic functions, agents, variables), and lookups by
  // universalIdentifier error while the application is absent, so the cache
  // cannot be patched into a correct state on its own.
  const refetchApplicationQueries = useCallback(() => {
    void apolloClient
      .refetchQueries({
        include: [
          FindOneApplicationDocument,
          FindOneApplicationByUniversalIdentifierDocument,
          FindOneApplicationSummaryDocument,
        ],
      })
      .catch(() => {
        // NOT_FOUND after an uninstall is a valid outcome.
      });
  }, [apolloClient]);

  const applyApplicationEventToApolloCache = useCallback(
    (
      detail: MetadataOperationBrowserEventDetail<ApplicationBroadcastRecord>,
    ) => {
      if (detail.operation.type === 'update') {
        const { updatedRecord, updatedFields } = detail.operation;

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

        // An install or upgrade attaches its metadata to the application as it
        // runs, so the relations are only complete once it leaves a
        // transitional state.
        if (
          !isDefined(updatedFields) ||
          (updatedFields.includes('state') &&
            updatedRecord.state === ApplicationState.INSTALLED)
        ) {
          refetchApplicationQueries();
        }

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

      refetchApplicationQueries();
    },
    [apolloClient, refetchApplicationQueries, setCurrentWorkspace],
  );

  useListenToMetadataOperationBrowserEvent<ApplicationBroadcastRecord>({
    metadataName: 'application',
    onMetadataOperationBrowserEvent: applyApplicationEventToApolloCache,
    skip,
  });
};
