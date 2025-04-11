import { animateModalURLState } from '@/auth/states/animateModalURLState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { AppPath } from '@/types/AppPath';
import { useSetRecoilState } from 'recoil';
import { WorkspaceUrls } from '~/generated/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const useImpersonationRedirect = () => {
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();
  const setAnimateModal = useSetRecoilState(animateModalURLState);

  const executeImpersonationRedirect = async (
    workspaceUrls: WorkspaceUrls,
    loginToken: string,
  ) => {
    setAnimateModal(false);
    return await redirectToWorkspaceDomain(
      getWorkspaceUrl(workspaceUrls),
      AppPath.Verify,
      { loginToken },
    );
  };

  return { executeImpersonationRedirect };
};
