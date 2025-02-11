import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { useImpersonateMutation } from '~/generated/graphql';

export const useImpersonationMutation = () => {
  const [impersonate] = useImpersonateMutation();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const executeImpersonationMutation = async (
    userId: string,
    workspaceId: string,
  ) => {
    const impersonateResult = await impersonate({
      variables: { userId, workspaceId },
    });

    if (!impersonateResult.data?.impersonate) {
      throw new Error('No impersonate result');
    }

    return {
      loginToken: impersonateResult.data.impersonate.loginToken,
      workspace: impersonateResult.data.impersonate.workspace,
      isCurrentWorkspace:
        impersonateResult.data.impersonate.workspace.id ===
        currentWorkspace?.id,
    };
  };

  return { executeImpersonationMutation };
};
