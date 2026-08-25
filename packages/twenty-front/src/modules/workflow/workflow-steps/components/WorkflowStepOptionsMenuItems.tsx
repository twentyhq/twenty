import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS } from '@/workflow/workflow-steps/constants/WorkflowStepOptionsMenuItemIds';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCopyPlus, IconPencil, IconTrash } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

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
        <MenuItem
          LeftIcon={IconPencil}
          text={changeNodeText}
          focused={
            selectedItemId === WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.changeNode
          }
          onClick={onChangeNode}
        />
      </SelectableListItem>
      {isDefined(onDuplicateNode) ? (
        <SelectableListItem
          itemId={WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.duplicateNode}
          onEnter={onDuplicateNode}
        >
          <MenuItem
            LeftIcon={IconCopyPlus}
            text={t`Duplicate node`}
            focused={
              selectedItemId ===
              WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.duplicateNode
            }
            onClick={onDuplicateNode}
          />
        </SelectableListItem>
      ) : null}
      {children}
      {isDefined(onDeleteNode) ? (
        <SelectableListItem
          itemId={WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.deleteNode}
          onEnter={onDeleteNode}
        >
          <MenuItem
            LeftIcon={IconTrash}
            text={t`Delete node`}
            accent="danger"
            focused={
              selectedItemId === WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.deleteNode
            }
            onClick={onDeleteNode}
          />
        </SelectableListItem>
      ) : null}
    </>
  );
};
