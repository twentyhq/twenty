import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useBuildSearchParamsFromUrlSyncedStates } from '@/domain-manager/hooks/useBuildSearchParamsFromUrlSyncedStates';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCallback } from 'react';

export const useRedirectToWorkspaceDomain = () => {
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirect } = useRedirect();

  const { buildSearchParamsFromUrlSyncedStates } =
    useBuildSearchParamsFromUrlSyncedStates();

  const redirectToWorkspaceDomain = useCallback(
    async ({
      baseUrl,
      pathname,
      searchParams,
      target,
    }: {
      baseUrl: string;
      pathname?: string;
      searchParams?: Record<string, string | boolean>;
      target?: string;
    }) => {
      if (!isMultiWorkspaceEnabled) {
        return;
      }
      redirect(
        buildWorkspaceUrl({
          endpoint: baseUrl,
          pathname,
          searchParams: {
            ...searchParams,
            ...(await buildSearchParamsFromUrlSyncedStates()),
          },
        }),
        target,
      );
    },
    [
      isMultiWorkspaceEnabled,
      redirect,
      buildWorkspaceUrl,
      buildSearchParamsFromUrlSyncedStates,
    ],
  );

  return {
    redirectToWorkspaceDomain,
  };
};
