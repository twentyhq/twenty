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
import { useSetRecoilState } from 'recoil';
import { MenuItemCommand, useIcons } from 'twenty-ui';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';

export const RightDrawerWorkflowSelectTriggerTypeContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getIcon } = useIcons();
  const { updateTrigger } = useUpdateWorkflowVersionTrigger({ workflow });

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const { openRightDrawer } = useRightDrawer();
  const setWorkflowSelectedNode = useSetRecoilState(workflowSelectedNodeState);

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        Data
      </RightDrawerWorkflowSelectStepTitle>
      {DATABASE_TRIGGER_TYPES.map((action) => (
        <MenuItemCommand
          key={action.defaultLabel}
          LeftIcon={getIcon(action.icon)}
          text={action.defaultLabel}
          onClick={async () => {
            await updateTrigger(
              getTriggerDefaultDefinition({
                defaultLabel: action.defaultLabel,
                type: action.type,
                activeObjectMetadataItems,
              }),
            );

            setWorkflowSelectedNode(TRIGGER_STEP_ID);

            openRightDrawer(RightDrawerPages.WorkflowStepEdit, {
              title: action.defaultLabel,
              Icon: getIcon(action.icon),
            });
          }}
        />
      ))}
      <RightDrawerWorkflowSelectStepTitle>
        Others
      </RightDrawerWorkflowSelectStepTitle>
      {OTHER_TRIGGER_TYPES.map((action) => (
        <MenuItemCommand
          key={action.defaultLabel}
          LeftIcon={getIcon(action.icon)}
          text={action.defaultLabel}
          onClick={async () => {
            await updateTrigger(
              getTriggerDefaultDefinition({
                defaultLabel: action.defaultLabel,
                type: action.type,
                activeObjectMetadataItems,
              }),
            );

            setWorkflowSelectedNode(TRIGGER_STEP_ID);

            openRightDrawer(RightDrawerPages.WorkflowStepEdit, {
              title: action.defaultLabel,
              Icon: getIcon(action.icon),
            });
          }}
        />
      ))}
    </RightDrawerStepListContainer>
  );
};
