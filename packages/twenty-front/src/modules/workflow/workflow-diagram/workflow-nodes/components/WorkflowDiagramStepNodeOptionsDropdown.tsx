import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { WorkflowStepOptionsMenuItems } from '@/workflow/workflow-steps/components/WorkflowStepOptionsMenuItems';
import { WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS } from '@/workflow/workflow-steps/constants/WorkflowStepOptionsMenuItemIds';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical } from 'twenty-ui/icon';
import { FloatingIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOptionsButtonContainer = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  position: absolute;
  right: calc(0px - ${themeCssVariables.spacing[4]});
  top: 0;
  transform: translateX(100%);
`;

export const WorkflowDiagramStepNodeOptionsDropdown = ({
  onChangeNode,
  onDuplicateNode,
  onDelete,
}: {
  onChangeNode: () => void;
  onDuplicateNode?: () => void;
  onDelete: () => void;
}) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();

  const dropdownId = useId();
  const selectableItemIds = [
    WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.changeNode,
    ...(isDefined(onDuplicateNode)
      ? [WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.duplicateNode]
      : []),
    WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.deleteNode,
  ];

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const closeDropdownThen = (action: () => void) => () => {
    closeDropdown(dropdownId);
    action();
  };

  const handleChangeNode = closeDropdownThen(onChangeNode);
  const handleDeleteNode = closeDropdownThen(onDelete);
  const handleDuplicateNode = isDefined(onDuplicateNode)
    ? closeDropdownThen(onDuplicateNode)
    : undefined;

  return (
    <StyledOptionsButtonContainer className="nodrag nopan">
      <ParentClickOutsideIdContext.Provider
        value={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
      >
        <OptionsDropdownMenu
          dropdownId={dropdownId}
          selectableItemIdArray={selectableItemIds}
          clickableComponent={
            <FloatingIconButton
              size="medium"
              Icon={IconDotsVertical}
              ariaLabel={t`Node options`}
            />
          }
          dropdownPlacement="right-start"
          shouldRegisterOptionsHotkey={false}
        >
          <WorkflowStepOptionsMenuItems
            selectedItemId={selectedItemId}
            changeNodeText={t`Change node`}
            onChangeNode={handleChangeNode}
            onDuplicateNode={handleDuplicateNode}
            onDeleteNode={handleDeleteNode}
          />
        </OptionsDropdownMenu>
      </ParentClickOutsideIdContext.Provider>
    </StyledOptionsButtonContainer>
  );
};
