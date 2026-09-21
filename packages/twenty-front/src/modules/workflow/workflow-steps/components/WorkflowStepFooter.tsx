import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
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
import { ListItem } from 'twenty-ui/primitives/navigation';
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
            <ListItem
              focused={
                selectedItemId ===
                WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.nodeSettings
              }
              onClick={getDropdownMenuItemClickHandler(handleNodeSettings)}
              startIcon={<IconSettings />}
            >
              <OverflowingTextWithTooltip text={t`Node settings`} />
            </ListItem>
          </SelectableListItem>
        ) : null}
        {hasViewAgentOption ? (
          <SelectableListItem itemId="view-agent" onEnter={handleViewAgent}>
            <ListItem
              focused={selectedItemId === 'view-agent'}
              onClick={getDropdownMenuItemClickHandler(handleViewAgent)}
              startIcon={<IconLego />}
            >
              <OverflowingTextWithTooltip text={t`View Agent`} />
            </ListItem>
          </SelectableListItem>
        ) : null}
        {hasViewRoleOption ? (
          <SelectableListItem itemId="view-role" onEnter={handleViewRole}>
            <ListItem
              focused={selectedItemId === 'view-role'}
              onClick={getDropdownMenuItemClickHandler(handleViewRole)}
              startIcon={<IconUsers />}
            >
              <OverflowingTextWithTooltip text={t`View Role`} />
            </ListItem>
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
