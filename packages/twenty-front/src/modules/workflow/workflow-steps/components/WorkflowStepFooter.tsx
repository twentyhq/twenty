import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WorkflowStepOptionsMenuItems } from '@/workflow/workflow-steps/components/WorkflowStepOptionsMenuItems';
import { WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS } from '@/workflow/workflow-steps/constants/WorkflowStepOptionsMenuItemIds';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { useDuplicateStep } from '@/workflow/workflow-steps/hooks/useDuplicateStep';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { IconLego, IconSettings, IconTrash, IconUsers } from 'twenty-ui/icon';
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
  const { t } = useLingui();
  const { duplicateStep } = useDuplicateStep();
  const { closeDropdown } = useCloseDropdown();
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

  const selectableItemIdArray = [
    WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.changeNode,
    ...(stepId !== TRIGGER_STEP_ID
      ? [
          WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.duplicateNode,
          WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.nodeSettings,
        ]
      : []),
    ...(hasViewAgentOption ? ['view-agent'] : []),
    ...(hasViewRoleOption ? ['view-role'] : []),
    ...(!shouldPinDeleteButton
      ? [WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.deleteNode]
      : []),
  ];

  const handleChangeNodeType = () => {
    closeDropdown(dropdownId);

    if (stepId === TRIGGER_STEP_ID) {
      openWorkflowTriggerTypeInSidePanel(workflowId);
    } else {
      openWorkflowEditStepTypeInSidePanel(workflowId);
    }
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

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const OptionsDropdown = (
    <OptionsDropdownMenu
      dropdownId={dropdownId}
      selectableItemIdArray={selectableItemIdArray}
    >
      <WorkflowStepOptionsMenuItems
        selectedItemId={selectedItemId}
        changeNodeText={t`Change node type`}
        onChangeNode={handleChangeNodeType}
        onDuplicateNode={
          stepId !== TRIGGER_STEP_ID ? handleDuplicateNode : undefined
        }
        onDeleteNode={!shouldPinDeleteButton ? handleDeleteNode : undefined}
      >
        {stepId !== TRIGGER_STEP_ID ? (
          <SelectableListItem
            itemId={WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.nodeSettings}
            onEnter={handleNodeSettings}
          >
            <DropdownListItem
              focused={
                selectedItemId ===
                WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.nodeSettings
              }
              onClick={handleNodeSettings}
              startIcon={<IconSettings />}
            >{t`Node settings`}</DropdownListItem>
          </SelectableListItem>
        ) : null}
        {hasViewAgentOption ? (
          <SelectableListItem itemId="view-agent" onEnter={handleViewAgent}>
            <DropdownListItem
              focused={selectedItemId === 'view-agent'}
              onClick={handleViewAgent}
              startIcon={<IconLego />}
            >{t`View Agent`}</DropdownListItem>
          </SelectableListItem>
        ) : null}
        {hasViewRoleOption ? (
          <SelectableListItem itemId="view-role" onEnter={handleViewRole}>
            <DropdownListItem
              focused={selectedItemId === 'view-role'}
              onClick={handleViewRole}
              startIcon={<IconUsers />}
            >{t`View Role`}</DropdownListItem>
          </SelectableListItem>
        ) : null}
      </WorkflowStepOptionsMenuItems>
    </OptionsDropdownMenu>
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
