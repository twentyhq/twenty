import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useGenerateJwtMutation } from '~/generated/graphql';

export const useWorkspaceSwitching = () => {
  const navigate = useNavigate();
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

    if (jwt.errors) {
      throw jwt.errors;
    }

    if (!jwt.data?.generateJWT) {
      throw new Error('could not create token');
    }
    const { tokens } = jwt.data.generateJWT;
    setTokenPair(tokens);
    navigate(`/objects/companies`);
    window.location.reload();
  };

  return { switchWorkspace };
};
