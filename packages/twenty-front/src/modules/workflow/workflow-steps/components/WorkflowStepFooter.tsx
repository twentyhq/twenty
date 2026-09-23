import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { WorkflowStepOptionsMenuItems } from '@/workflow/workflow-steps/components/WorkflowStepOptionsMenuItems';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { useDuplicateStep } from '@/workflow/workflow-steps/hooks/useDuplicateStep';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useSidePanelOptionsHotkeys } from '@/side-panel/hooks/useSidePanelOptionsHotkeys';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import {
  IconDotsVertical,
  IconLego,
  IconSettings,
  IconTrash,
  IconUsers,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const WorkflowStepFooter = ({
  stepId,
  additionalActions,
}: {
  stepId: string;
  additionalActions?: React.ReactNode[];
}) => {
  const dropdownId = useId();
  const { closeDropdown } = useCloseDropdown();
  const { handleContentKeyDown } = useSidePanelOptionsHotkeys(dropdownId);
  const { t } = useLingui();
  const { duplicateStep } = useDuplicateStep();
  const workflowId = useSidePanelWorkflowIdOrThrow();
  const {
    openWorkflowEditStepTypeInSidePanel,
    openWorkflowStepSettingsInSidePanel,
    openWorkflowTriggerTypeInSidePanel,
  } = useSidePanelWorkflowNavigation();
  const { deleteStep } = useDeleteStep();
  const navigateSettings = useNavigateSettings();
  const workflowAiAgentActionAgent = useAtomStateValue(
    workflowAiAgentActionAgentState,
  );
  const shouldPinDeleteButton =
    !isDefined(additionalActions) || additionalActions.length === 0;

  const agentId = workflowAiAgentActionAgent?.id;
  const hasViewAgentOption = isDefined(agentId);
  const hasViewRoleOption = isDefined(workflowAiAgentActionAgent?.roleId);

  const handleChangeNodeType = () => {
    closeDropdown(dropdownId);

    if (stepId === TRIGGER_STEP_ID) {
      openWorkflowTriggerTypeInSidePanel(workflowId);
      return;
    }

    openWorkflowEditStepTypeInSidePanel(workflowId);
  };

  const handleDuplicateNode = () => {
    closeDropdown(dropdownId);
    duplicateStep({ stepId });
  };

  const handleDeleteNode = () => {
    closeDropdown(dropdownId);
    deleteStep(stepId);
  };

  const handleNodeSettings = () => {
    closeDropdown(dropdownId);
    openWorkflowStepSettingsInSidePanel({ workflowId, stepId });
  };

  const handleViewAgent = () => {
    closeDropdown(dropdownId);
    if (isDefined(agentId)) {
      navigateSettings(SettingsPath.AiAgentDetail, { agentId });
    }
  };

  const handleViewRole = () => {
    closeDropdown(dropdownId);
    if (isDefined(workflowAiAgentActionAgent?.roleId)) {
      navigateSettings(SettingsPath.RoleDetail, {
        roleId: workflowAiAgentActionAgent.roleId,
      });
    }
  };

  const OptionsDropdown = (
    <DropdownRoot
      dropdownId={dropdownId}
      type="menu"
      globalHotkeysConfig={{ enableGlobalHotkeysWithModifiers: true }}
    >
      <Dropdown.Trigger
        data-select-disable
        render={
          <IconButton aria-label={t`Options`} size="sm" variant="outline">
            <IconDotsVertical />
          </IconButton>
        }
      />
      <Dropdown.Content
        data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}
        side="top"
        align="end"
        sideOffset={8}
        onKeyDown={handleContentKeyDown}
      >
        <Dropdown.Section>
          <WorkflowStepOptionsMenuItems
            changeNodeText={t`Change node type`}
            onChangeNode={handleChangeNodeType}
            onDuplicateNode={
              stepId !== TRIGGER_STEP_ID ? handleDuplicateNode : undefined
            }
            onDeleteNode={!shouldPinDeleteButton ? handleDeleteNode : undefined}
          >
            {stepId !== TRIGGER_STEP_ID ? (
              <Dropdown.ActionItem
                onClick={handleNodeSettings}
                startIcon={<IconSettings />}
              >
                {t`Node settings`}
              </Dropdown.ActionItem>
            ) : null}
            {hasViewAgentOption ? (
              <Dropdown.ActionItem
                onClick={handleViewAgent}
                startIcon={<IconLego />}
              >
                {t`View Agent`}
              </Dropdown.ActionItem>
            ) : null}
            {hasViewRoleOption ? (
              <Dropdown.ActionItem
                onClick={handleViewRole}
                startIcon={<IconUsers />}
              >
                {t`View Role`}
              </Dropdown.ActionItem>
            ) : null}
          </WorkflowStepOptionsMenuItems>
        </Dropdown.Section>
      </Dropdown.Content>
    </DropdownRoot>
  );

  const deleteButton = (
    <Button
      size="sm"
      onClick={() => {
        deleteStep(stepId);
      }}
      startIcon={<IconTrash />}
      color="danger"
    >{t`Delete`}</Button>
  );

  return (
    <SidePanelFooter
      actions={[
        OptionsDropdown,
        ...(additionalActions ?? []),
        ...(shouldPinDeleteButton ? [deleteButton] : []),
      ]}
    />
  );
};
