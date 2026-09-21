import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS } from '@/workflow/workflow-steps/constants/WorkflowStepOptionsMenuItemIds';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCopyPlus, IconPencil, IconTrash } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

type WorkflowStepOptionsMenuItemsProps = {
  selectedItemId: string | null;
  changeNodeText: string;
  onChangeNode: () => void;
  onDuplicateNode?: () => void;
  onDeleteNode?: () => void;
  children?: ReactNode;
};

export const WorkflowStepOptionsMenuItems = ({
  selectedItemId,
  changeNodeText,
  onChangeNode,
  onDuplicateNode,
  onDeleteNode,
  children,
}: WorkflowStepOptionsMenuItemsProps) => {
  const { t } = useLingui();

  return (
    <>
      <SelectableListItem
        itemId={WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.changeNode}
        onEnter={onChangeNode}
      >
        <ListItem
          startIcon={<IconPencil />}
          focused={
            selectedItemId === WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.changeNode
          }
          onClick={getDropdownMenuItemClickHandler(onChangeNode)}
        >
          <OverflowingTextWithTooltip text={changeNodeText} />
        </ListItem>
      </SelectableListItem>
      {isDefined(onDuplicateNode) ? (
        <SelectableListItem
          itemId={WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.duplicateNode}
          onEnter={onDuplicateNode}
        >
          <ListItem
            startIcon={<IconCopyPlus />}
            focused={
              selectedItemId ===
              WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.duplicateNode
            }
            onClick={getDropdownMenuItemClickHandler(onDuplicateNode)}
          >
            <OverflowingTextWithTooltip text={t`Duplicate node`} />
          </ListItem>
        </SelectableListItem>
      ) : null}
      {children}
      {isDefined(onDeleteNode) ? (
        <SelectableListItem
          itemId={WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.deleteNode}
          onEnter={onDeleteNode}
        >
          <ListItem
            startIcon={<IconTrash />}
            color="danger"
            focused={
              selectedItemId === WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.deleteNode
            }
            onClick={getDropdownMenuItemClickHandler(onDeleteNode)}
          >
            <OverflowingTextWithTooltip text={t`Delete node`} />
          </ListItem>
        </SelectableListItem>
      ) : null}
    </>
  );
};
