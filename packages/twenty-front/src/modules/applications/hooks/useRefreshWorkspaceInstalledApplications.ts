import {
  workspaceInstalledApplicationsRefreshState,
  workspaceInstalledApplicationsVersionState,
} from '@/applications/states/workspaceInstalledApplicationsRefreshState';
import { hasInstalledApplications } from '@/applications/utils/hasInstalledApplications';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { getSessionGeneration } from '@/auth/utils/getSessionGeneration';
import { useApolloClient } from '@apollo/client/react';
import { captureException } from '@sentry/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { GetWorkspaceInstalledApplicationsDocument } from '~/generated-metadata/graphql';

export const useRefreshWorkspaceInstalledApplications = () => {
  const client = useApolloClient();
  const store = useStore();

  return useCallback(
    async (requiredApplicationIds: string[] = []) => {
      const workspace = store.get(currentWorkspaceState.atom);
      if (!isDefined(workspace) || !store.get(isCookieAuthActiveState.atom)) {
        return false;
      }

      const version = store.get(
        workspaceInstalledApplicationsVersionState.atom,
      );
      const sessionGeneration = getSessionGeneration();
      const isCurrentUserLoaded = store.get(isCurrentUserLoadedState.atom);
      const previous = store.get(
        workspaceInstalledApplicationsRefreshState.atom,
      );
      if (
        previous?.workspaceId === workspace.id &&
        previous.sessionGeneration === sessionGeneration &&
        previous.version === version &&
        previous.isCurrentUserLoaded === isCurrentUserLoaded
      ) {
        return previous.completed;
      }
      if (
        !isDefined(previous) &&
        version === 0 &&
        isCurrentUserLoaded &&
        hasInstalledApplications(workspace, requiredApplicationIds)
      ) {
        return true;
      }

      const completed = client
        .query({
          query: GetWorkspaceInstalledApplicationsDocument,
          fetchPolicy: 'no-cache',
          context: { queryDeduplication: false },
        })
        .then(({ data }) => {
          const currentWorkspace = store.get(currentWorkspaceState.atom);
          if (
            !isDefined(currentWorkspace) ||
            currentWorkspace.id !== workspace.id ||
            currentWorkspace.installedApplications !==
              workspace.installedApplications ||
            data?.currentWorkspace.id !== workspace.id ||
            getSessionGeneration() !== sessionGeneration ||
            !store.get(isCookieAuthActiveState.atom) ||
            store.get(workspaceInstalledApplicationsVersionState.atom) !==
              version
          ) {
            return false;
          }

          store.set(currentWorkspaceState.atom, {
            ...currentWorkspace,
            installedApplications: data.currentWorkspace.installedApplications,
          });
          return true;
        })
        .catch((error: unknown) => {
          captureException(error);
          return false;
        });
      const refresh = {
        workspaceId: workspace.id,
        sessionGeneration,
        version,
        completed,
        isCurrentUserLoaded,
      };
      store.set(workspaceInstalledApplicationsRefreshState.atom, refresh);

      const applied = await completed;
      if (
        !applied &&
        store.get(workspaceInstalledApplicationsRefreshState.atom) === refresh
      ) {
        store.set(workspaceInstalledApplicationsRefreshState.atom, null);
        store.set(workspaceInstalledApplicationsVersionState.atom, version + 1);
      }
      return applied;
    },
    [client, store],
  );
};
