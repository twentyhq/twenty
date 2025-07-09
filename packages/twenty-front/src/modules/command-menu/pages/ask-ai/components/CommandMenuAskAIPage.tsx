import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { AIChatTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/AIChatTab';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const StyledEmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

export const CommandMenuAskAIPage = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const agentId = currentWorkspace?.defaultAgent?.id;
  
  if (!agentId) {
    return (
      <StyledContainer>
        <StyledEmptyState>
          No AI Agent found.
        </StyledEmptyState>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <AIChatTab agentId={agentId} />
    </StyledContainer>
  );
}; 