import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import {
  type WorkflowTrigger,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { getTriggerDefaultDefinition } from '@/workflow/workflow-trigger/utils/getTriggerDefaultDefinition';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const CommandMenuWorkflowSelectTriggerTypeContent = () => {
  const { getIcon } = useIcons();
  const workflowId = useCommandMenuWorkflowIdOrThrow();
  const { updateTrigger } = useUpdateWorkflowVersionTrigger();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );
  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();
  const flow = useFlowOrThrow();

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
      let updatedTrigger: WorkflowTrigger | null = getTriggerDefaultDefinition({
        defaultLabel,
        type,
        activeNonSystemObjectMetadataItems,
      });

      if (isDefined(flow.trigger)) {
        updatedTrigger = {
          ...updatedTrigger,
          position: flow.trigger.position,
          nextStepIds: flow.trigger.nextStepIds,
        };
      }

      await updateTrigger(updatedTrigger);

      setWorkflowSelectedNode(TRIGGER_STEP_ID);

      openWorkflowEditStepInCommandMenu(
        workflowId,
        defaultLabel,
        getIcon(icon),
        TRIGGER_STEP_ID,
      );
    };
  };

  const theme = useTheme();

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        {t`Data`}
      </RightDrawerWorkflowSelectStepTitle>
      {DATABASE_TRIGGER_TYPES.map((action) => {
        const Icon = getIcon(action.icon);
        return (
          <MenuItem
            withIconContainer={true}
            key={action.defaultLabel}
            LeftIcon={() => <Icon color={theme.color.blue} size={16} />}
            text={action.defaultLabel}
            onClick={handleTriggerTypeClick(action)}
          />
        );
      })}

      <RightDrawerWorkflowSelectStepTitle>
        {t`Others`}
      </RightDrawerWorkflowSelectStepTitle>
      {OTHER_TRIGGER_TYPES.map((action) => {
        const Icon = getIcon(action.icon);
        return (
          <MenuItem
            withIconContainer={true}
            key={action.defaultLabel}
            LeftIcon={() => <Icon color={theme.color.purple} size={16} />}
            text={action.defaultLabel}
            onClick={handleTriggerTypeClick(action)}
          />
        );
      })}
    </RightDrawerStepListContainer>
  );
};
