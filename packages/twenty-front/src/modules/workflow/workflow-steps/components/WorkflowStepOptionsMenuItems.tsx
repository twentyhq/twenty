import { ListItem } from 'twenty-ui/primitives/navigation';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS } from '@/workflow/workflow-steps/constants/WorkflowStepOptionsMenuItemIds';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components';
import { IconCopyPlus, IconPencil, IconTrash } from 'twenty-ui/icon';

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
          onClick={onChangeNode}
        >
          {changeNodeText}
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
            onClick={onDuplicateNode}
          >{t`Duplicate node`}</ListItem>
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
            onClick={onDeleteNode}
          >{t`Delete node`}</ListItem>
        </SelectableListItem>
      ) : null}
    </>
  );
};
