import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import {
  type WorkflowTriggerType,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { getTriggerDefaultDefinition } from '@/workflow/workflow-trigger/utils/getTriggerDefaultDefinition';
import { useTheme } from '@emotion/react';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';

export const CommandMenuWorkflowSelectTriggerTypeContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getIcon } = useIcons();
  const { updateTrigger } = useUpdateWorkflowVersionTrigger();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const setWorkflowSelectedNode = useSetRecoilComponentState(
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
          activeNonSystemObjectMetadataItems,
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

  const theme = useTheme();

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        Data
      </RightDrawerWorkflowSelectStepTitle>
      {DATABASE_TRIGGER_TYPES.map((action) => {
        const Icon = getIcon(action.icon);
        return (
          <MenuItemCommand
            key={action.defaultLabel}
            LeftIcon={() => <Icon color={theme.color.blue} />}
            text={action.defaultLabel}
            onClick={handleTriggerTypeClick(action)}
          />
        );
      })}

      <RightDrawerWorkflowSelectStepTitle>
        Others
      </RightDrawerWorkflowSelectStepTitle>
      {OTHER_TRIGGER_TYPES.map((action) => {
        const Icon = getIcon(action.icon);
        return (
          <MenuItemCommand
            key={action.defaultLabel}
            LeftIcon={() => <Icon color={theme.color.purple} />}
            text={action.defaultLabel}
            onClick={handleTriggerTypeClick(action)}
          />
        );
      })}
    </RightDrawerStepListContainer>
  );
};
