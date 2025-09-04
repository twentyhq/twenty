import styled from '@emotion/styled';
import { Label } from 'twenty-ui/display';

const StyledContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding-block: ${({ theme }) => theme.spacing(0.5)};
  padding-inline: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowDiagramEdgeLabel = ({ label }: { label: string }) => {
  return (
    <StyledContainer>
      <Label>{label}</Label>
    </StyledContainer>
  );
};
