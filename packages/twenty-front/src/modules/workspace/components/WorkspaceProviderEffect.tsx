import { useRecoilValue } from 'recoil';

import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { useEffect } from 'react';
import { isDefined } from '~/utils/isDefined';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useDomainBackToWorkspace } from '@/domain-manager/hooks/useDomainBackToWorkspace';
import { useDefaultDomain } from '@/domain-manager/hooks/useDefaultDomain';
import { useWorkspaceSubdomain } from '@/domain-manager/hooks/useWorkspaceSubdomain';
import { useLastAuthenticateWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticateWorkspaceDomain';

export const WorkspaceProviderEffect = () => {
  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const { lastAuthenticateWorkspaceDomain } =
    useLastAuthenticateWorkspaceDomain();

  const backToWorkspace = useDomainBackToWorkspace();
  const { isDefaultDomain } = useDefaultDomain();
  const { workspaceSubdomain } = useWorkspaceSubdomain();

  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);

  useEffect(() => {
    if (isMultiWorkspaceEnabled && isDefined(workspacePublicData?.subdomain)) {
      backToWorkspace(workspacePublicData.subdomain);
    }
  }, [
    workspaceSubdomain,
    isMultiWorkspaceEnabled,
    backToWorkspace,
    workspacePublicData,
  ]);

  useEffect(() => {
    if (
      isMultiWorkspaceEnabled &&
      isDefined(lastAuthenticateWorkspaceDomain?.subdomain) &&
      isDefaultDomain
    ) {
      backToWorkspace(lastAuthenticateWorkspaceDomain.subdomain);
    }
  }, [
    isMultiWorkspaceEnabled,
    isDefaultDomain,
    lastAuthenticateWorkspaceDomain,
    backToWorkspace,
  ]);

  useEffect(() => {
    try {
      if (isDefined(workspacePublicData?.logo)) {
        const link: HTMLLinkElement =
          document.querySelector("link[rel*='icon']") ||
          document.createElement('link');
        link.rel = 'icon';
        link.href = workspacePublicData.logo;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }, [workspacePublicData]);

  return <></>;
};
