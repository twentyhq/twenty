import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import {
  WorkflowTriggerType,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { getTriggerDefaultDefinition } from '@/workflow/workflow-trigger/utils/getTriggerDefaultDefinition';
import { useIcons } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';

export const CommandMenuWorkflowSelectTriggerTypeContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getIcon } = useIcons();
  const { updateTrigger } = useUpdateWorkflowVersionTrigger({ workflow });

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );
  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const handleTriggerTypeClick = ({
    type,
    defaultLabel,
    icon,
  }: {
    type: WorkflowTriggerType;
    defaultLabel: string;
    icon: string;
  }) => {
    return async () => {
      await updateTrigger(
        getTriggerDefaultDefinition({
          defaultLabel,
          type,
          activeObjectMetadataItems,
        }),
      );

      setWorkflowSelectedNode(TRIGGER_STEP_ID);

      openWorkflowEditStepInCommandMenu(
        workflow.id,
        defaultLabel,
        getIcon(icon),
      );
    };
  };

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
          onClick={handleTriggerTypeClick(action)}
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
          onClick={handleTriggerTypeClick(action)}
        />
      ))}
    </RightDrawerStepListContainer>
  );
};
