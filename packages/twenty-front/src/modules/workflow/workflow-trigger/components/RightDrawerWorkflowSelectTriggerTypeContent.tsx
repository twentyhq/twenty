import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';
import { TRIGGER_TYPES } from '@/workflow/constants/TriggerTypes';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/hooks/useUpdateWorkflowVersionTrigger';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { getTriggerDefaultDefinition } from '@/workflow/utils/getTriggerDefaultDefinition';
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
      {TRIGGER_TYPES.map((action) => (
        <MenuItem
          key={action.type}
          LeftIcon={action.icon}
          text={action.name}
          onClick={async () => {
            await updateTrigger(
              getTriggerDefaultDefinition({
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
