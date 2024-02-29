import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { useGenerateJwtMutation } from '~/generated/graphql';

export const useWorkspaceSwitching = () => {
  const navigate = useNavigate();
  const setTokenPair = useSetRecoilState(tokenPairState);
  const [generateJWT] = useGenerateJwtMutation();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  const swtitchWorkspace = async (workspaceId: string) => {
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
    setCurrentWorkspace(jwt.data.generateJWT.user.defaultWorkspace ?? '');
    if (jwt.data.generateJWT.user.workspaceMember) {
      const member = jwt.data.generateJWT.user.workspaceMember;
      const workspaceMember = {
        ...member,
        colorScheme: member.colorScheme as ColorScheme,
      };
      setCurrentWorkspaceMember(workspaceMember);
    }
    navigate(`/objects/companies`);
  };

  return { swtitchWorkspace };
};
