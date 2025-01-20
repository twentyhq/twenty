import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { getTriggerDefaultDefinition } from '@/workflow/workflow-trigger/utils/getTriggerDefaultDefinition';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
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

export const RightDrawerWorkflowSelectTriggerTypeContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { updateTrigger } = useUpdateWorkflowVersionTrigger({ workflow });

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const { openRightDrawer } = useRightDrawer();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  return (
    <StyledActionListContainer>
      <StyledSectionTitle>Data</StyledSectionTitle>
      {DATABASE_TRIGGER_TYPES.map((action) => (
        <MenuItem
          key={action.name}
          LeftIcon={action.icon}
          text={action.name}
          onClick={async () => {
            await updateTrigger(
              getTriggerDefaultDefinition({
                name: action.name,
                type: action.type,
                activeObjectMetadataItems,
              }),
            );

            setWorkflowSelectedNode(TRIGGER_STEP_ID);

            openRightDrawer(RightDrawerPages.WorkflowStepEdit);
          }}
        />
      ))}
      <StyledSectionTitle>Others</StyledSectionTitle>
      {OTHER_TRIGGER_TYPES.map((action) => (
        <MenuItem
          key={action.name}
          LeftIcon={action.icon}
          text={action.name}
          onClick={async () => {
            await updateTrigger(
              getTriggerDefaultDefinition({
                name: action.name,
                type: action.type,
                activeObjectMetadataItems,
              }),
            );

            setWorkflowSelectedNode(TRIGGER_STEP_ID);

            openRightDrawer(RightDrawerPages.WorkflowStepEdit);
          }}
        />
      ))}
    </StyledActionListContainer>
  );
};
