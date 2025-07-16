import { AIChatThreadsList } from '@/ai/components/AIChatThreadsList';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 100%;
  justify-content: center;
`;

export const CommandMenuAIChatThreadsPage = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const agentId = currentWorkspace?.defaultAgent?.id;

  if (!agentId) {
    return (
      <StyledContainer>
        <StyledEmptyState>No AI Agent found.</StyledEmptyState>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <AIChatThreadsList agentId={agentId} />
    </StyledContainer>
  );
};
