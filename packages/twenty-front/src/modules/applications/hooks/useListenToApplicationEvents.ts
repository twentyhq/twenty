import { type ApplicationBroadcastRecord } from '@/applications/types/ApplicationBroadcastRecord';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { FIND_APPLICATION_CONNECTION_PROVIDERS } from '@/settings/applications/graphql/queries/findApplicationConnectionProviders';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import {
  FindAdminApplicationRegistrationInstalledWorkspacesDocument,
  FindOneAdminApplicationRegistrationDocument,
} from '~/generated-admin/graphql';
import {
  FindManyApplicationsDocument,
  FindOneApplicationByUniversalIdentifierDocument,
  FindOneApplicationDocument,
  FindOneApplicationSummaryDocument,
} from '~/generated-metadata/graphql';

// An application row carries none of the metadata an install, upgrade or
// uninstall attaches to it — roles, objects, logic functions, connection
// providers — so the broadcast payload cannot be applied to the cache: every
// application view is re-read from the server instead.
export const useListenToApplicationEvents = () => {
  const apolloClient = useApolloClient();
  const apolloAdminClient = useApolloAdminClient();
  const { loadCurrentUser } = useLoadCurrentUser();

  const refreshApplications = useCallback(
    (
      detail: MetadataOperationBrowserEventDetail<ApplicationBroadcastRecord>,
    ) => {
      if (detail.operation.type === 'delete') {
        apolloClient.cache.evict({
          id: apolloClient.cache.identify({
            __typename: 'Application',
            id: detail.operation.deletedRecordId,
          }),
        });
        apolloClient.cache.gc();
      }

      void apolloClient
        .refetchQueries({
          include: [
            FindManyApplicationsDocument,
            FindOneApplicationDocument,
            FindOneApplicationByUniversalIdentifierDocument,
            FindOneApplicationSummaryDocument,
            FIND_APPLICATION_CONNECTION_PROVIDERS,
          ],
        })
        .catch(() => {
          // Single-application lookups throw once the application is gone, which
          // is the expected outcome of an uninstall.
        });

      // The admin panel reads applications through its own Apollo client.
      void apolloAdminClient
        .refetchQueries({
          include: [
            FindOneAdminApplicationRegistrationDocument,
            FindAdminApplicationRegistrationInstalledWorkspacesDocument,
          ],
        })
        .catch(() => {
          // Best-effort: the admin views keep their last value.
        });

      // App chips resolve their logo from the workspace, whose installed
      // applications only change with the current user payload.
      void loadCurrentUser().catch(() => {
        // Best-effort: the workspace keeps its last value.
      });
    },
    [apolloAdminClient, apolloClient, loadCurrentUser],
  );

  useListenToMetadataOperationBrowserEvent<ApplicationBroadcastRecord>({
    metadataName: 'application',
    onMetadataOperationBrowserEvent: refreshApplications,
  });
};
