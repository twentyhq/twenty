import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCopyPlus,
  IconDotsVertical,
  IconPencil,
  IconTrash,
} from 'twenty-ui/icon';
import { FloatingIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
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

const WORKFLOW_NODE_OPTION_IDS = {
  changeNode: 'change-node',
  duplicateNode: 'duplicate-node',
  deleteNode: 'delete-node',
} as const;

export const WorkflowDiagramStepNodeOptionsDropdown = ({
  nodeId,
  onChangeNode,
  onDuplicateNode,
  onDelete,
}: {
  nodeId: string;
  onChangeNode: () => void;
  onDuplicateNode?: () => void;
  onDelete: () => void;
}) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();

  const dropdownId = `workflow-diagram-node-options-${nodeId}`;
  const selectableItemIds = [
    WORKFLOW_NODE_OPTION_IDS.changeNode,
    ...(isDefined(onDuplicateNode)
      ? [WORKFLOW_NODE_OPTION_IDS.duplicateNode]
      : []),
    WORKFLOW_NODE_OPTION_IDS.deleteNode,
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
  const handleDuplicateNode = closeDropdownThen(() => onDuplicateNode?.());

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
          <SelectableListItem
            itemId={WORKFLOW_NODE_OPTION_IDS.changeNode}
            onEnter={handleChangeNode}
          >
            <MenuItem
              LeftIcon={IconPencil}
              text={t`Change node`}
              focused={selectedItemId === WORKFLOW_NODE_OPTION_IDS.changeNode}
              onClick={handleChangeNode}
            />
          </SelectableListItem>
          {isDefined(onDuplicateNode) ? (
            <SelectableListItem
              itemId={WORKFLOW_NODE_OPTION_IDS.duplicateNode}
              onEnter={handleDuplicateNode}
            >
              <MenuItem
                LeftIcon={IconCopyPlus}
                text={t`Duplicate node`}
                focused={
                  selectedItemId === WORKFLOW_NODE_OPTION_IDS.duplicateNode
                }
                onClick={handleDuplicateNode}
              />
            </SelectableListItem>
          ) : null}
          <SelectableListItem
            itemId={WORKFLOW_NODE_OPTION_IDS.deleteNode}
            onEnter={handleDeleteNode}
          >
            <MenuItem
              LeftIcon={IconTrash}
              text={t`Delete node`}
              accent="danger"
              focused={selectedItemId === WORKFLOW_NODE_OPTION_IDS.deleteNode}
              onClick={handleDeleteNode}
            />
          </SelectableListItem>
        </OptionsDropdownMenu>
      </ParentClickOutsideIdContext.Provider>
    </StyledOptionsButtonContainer>
  );
};
