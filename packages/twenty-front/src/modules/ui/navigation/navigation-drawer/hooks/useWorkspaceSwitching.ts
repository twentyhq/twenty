import { useRecoilValue } from 'recoil';
import { AppPath } from '@/types/AppPath';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSwitchWorkspaceMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { buildWorkspaceUrl } from '~/utils/workspace-url.helper';

export const useWorkspaceSwitching = () => {
  const [switchWorkspaceMutation] = useSwitchWorkspaceMutation();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const switchWorkspace = async (workspaceId: string) => {
    if (currentWorkspace?.id === workspaceId) return;

    const { data, errors } = await switchWorkspaceMutation({
      variables: {
        workspaceId,
      },
    });

    if (isDefined(errors) || !isDefined(data?.switchWorkspace.subdomain)) {
      return (window.location.href = AppPath.Index);
    }

    window.location.href = buildWorkspaceUrl(data.switchWorkspace.subdomain);
  };

  return { switchWorkspace };
};
