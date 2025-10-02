import { LazyAIChatTab } from '@/ai/components/LazyAIChatTab';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const CommandMenuAskAIPage = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const agentId = currentWorkspace?.defaultAgent?.id;

  if (!agentId) {
    return null;
  }

  return (
    <StyledContainer>
      <LazyAIChatTab agentId={agentId} />
    </StyledContainer>
  );
};
