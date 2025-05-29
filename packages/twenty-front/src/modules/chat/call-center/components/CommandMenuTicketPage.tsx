import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import styled from '@emotion/styled';

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ theme }) => theme.spacing(13.75)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  position: relative;
`;

const StyledTicketHeader = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: 600;
`;

export const CommandMenuTicketPage = () => {
  return (
    <RightDrawerStepListContainer>
      <StyledDiv>
        <StyledTicketHeader>{'Service Data'}</StyledTicketHeader>
      </StyledDiv>
    </RightDrawerStepListContainer>
  );
};
