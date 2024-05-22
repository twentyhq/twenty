import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { AppPath } from '@/types/AppPath';
import { useGenerateJwtMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useWorkspaceSwitching = () => {
  const setTokenPair = useSetRecoilState(tokenPairState);
  const [generateJWT] = useGenerateJwtMutation();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const switchWorkspace = async (workspaceId: string) => {
    if (currentWorkspace?.id === workspaceId) return;
    const jwt = await generateJWT({
      variables: {
        workspaceId,
      },
    });

    if (isDefined(jwt.errors)) {
      throw jwt.errors;
    }

    if (!isDefined(jwt.data?.generateJWT)) {
      throw new Error('could not create token');
    }

    const { tokens } = jwt.data.generateJWT;
    setTokenPair(tokens);
    window.location.href = AppPath.Index;
  };

  return { switchWorkspace };
};
