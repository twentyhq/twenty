import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { WorkflowDiagramHandleTarget } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleTarget';
import { IconPlus } from 'twenty-ui/display';

const StyledPlaceholderContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
  justify-content: center;
  min-width: 160px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
  white-space: nowrap;
`;

const StyledPlaceholderText = styled.span`
  font-weight: 500;
`;

const StyledIconWrapper = styled.span`
  align-items: center;
  display: inline-flex;
`;

export const WorkflowDiagramPlaceholderNode = () => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledPlaceholderContainer>
      <WorkflowDiagramHandleTarget />
      <StyledIconWrapper>
        <IconPlus size={theme.icon.size.md} />
      </StyledIconWrapper>
      <StyledPlaceholderText>{t`Select an action`}</StyledPlaceholderText>
    </StyledPlaceholderContainer>
  );
};
