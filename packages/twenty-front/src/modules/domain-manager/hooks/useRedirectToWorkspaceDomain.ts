import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useBuildSearchParamsFromUrlSyncedStates } from '@/domain-manager/hooks/useBuildSearchParamsFromUrlSyncedStates';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { forgetStayOnDefaultDomainRequest } from '@/domain-manager/utils/forgetStayOnDefaultDomainRequest';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useRedirectToWorkspaceDomain = () => {
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirect } = useRedirect();

  const { buildSearchParamsFromUrlSyncedStates } =
    useBuildSearchParamsFromUrlSyncedStates();

  const redirectToWorkspaceDomain = async (
    baseUrl: string,
    pathname?: string,
    searchParams?: Record<string, string | boolean>,
    target?: string,
  ) => {
    if (!isMultiWorkspaceEnabled) return;

    // Landing on a workspace ends the visit to the default domain, so a later
    // plain visit is auto-redirected again
    forgetStayOnDefaultDomainRequest();

    redirect(
      buildWorkspaceUrl(baseUrl, pathname, {
        ...searchParams,
        ...(await buildSearchParamsFromUrlSyncedStates()),
      }),
      target,
    );
  };

  return {
    redirectToWorkspaceDomain,
  };
};
