import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { OTHER_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/OtherActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import styled from '@emotion/styled';
import { MenuItem } from 'twenty-ui';

const StyledActionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  padding-block: ${({ theme }) => theme.spacing(1)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

export const RightDrawerWorkflowSelectActionContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { createStep } = useCreateStep({
    workflow,
  });

  return (
    <StyledActionListContainer>
      <StyledSectionTitle>Records</StyledSectionTitle>
      {RECORD_ACTIONS.map((action) => (
        <MenuItem
          key={action.type}
          LeftIcon={action.icon}
          text={action.label}
          onClick={() => createStep(action.type)}
        />
      ))}
      <StyledSectionTitle>Other</StyledSectionTitle>
      {OTHER_ACTIONS.map((action) => (
        <MenuItem
          key={action.type}
          LeftIcon={action.icon}
          text={action.label}
          onClick={() => createStep(action.type)}
        />
      ))}
    </StyledActionListContainer>
  );
};
