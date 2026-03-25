import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import {
  type WorkflowTrigger,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { SidePanelStepListContainer } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepContainer';
import { SidePanelWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepTitle';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { OTHER_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/OtherTriggerTypes';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { getTriggerDefaultDefinition } from '@/workflow/workflow-trigger/utils/getTriggerDefaultDefinition';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';
import { useContext } from 'react';
import { MenuItem } from 'twenty-ui/navigation';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const SidePanelWorkflowSelectTriggerTypeContent = () => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const workflowId = useSidePanelWorkflowIdOrThrow();
  const { updateTrigger } = useUpdateWorkflowVersionTrigger();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const setWorkflowSelectedNode = useSetAtomComponentState(
    workflowSelectedNodeComponentState,
  );
  const { openWorkflowEditStepInSidePanel } = useSidePanelWorkflowNavigation();
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

      openWorkflowEditStepInSidePanel(
        workflowId,
        defaultLabel,
        getIcon(icon),
        TRIGGER_STEP_ID,
      );
    };
  };

  return (
    <SidePanelStepListContainer>
      <SidePanelWorkflowSelectStepTitle>
        {t`Data`}
      </SidePanelWorkflowSelectStepTitle>
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

      <SidePanelWorkflowSelectStepTitle>
        {t`Others`}
      </SidePanelWorkflowSelectStepTitle>
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
    </SidePanelStepListContainer>
  );
};
