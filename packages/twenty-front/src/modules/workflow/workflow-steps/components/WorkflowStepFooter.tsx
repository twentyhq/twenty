import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { useDuplicateStep } from '@/workflow/workflow-steps/hooks/useDuplicateStep';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { IconCopyPlus, IconPencil, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

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
  const workflowId = useCommandMenuWorkflowIdOrThrow();
  const {
    openWorkflowEditStepTypeInCommandMenu,
    openWorkflowTriggerTypeInCommandMenu,
  } = useWorkflowCommandMenu();
  const { deleteStep } = useDeleteStep();
  const shouldPinDeleteButton =
    !isDefined(additionalActions) || additionalActions.length === 0;

  const selectableItemIdArray = [
    'change-node-type',
    ...(stepId !== TRIGGER_STEP_ID ? ['duplicate'] : []),
    ...(!shouldPinDeleteButton ? ['delete'] : []),
  ];

  const handleChangeNodeType = () => {
    closeDropdown(dropdownId);

    if (stepId === TRIGGER_STEP_ID) {
      openWorkflowTriggerTypeInCommandMenu(workflowId);
    } else {
      openWorkflowEditStepTypeInCommandMenu(workflowId);
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

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const OptionsDropdown = (
    <OptionsDropdownMenu
      dropdownId={dropdownId}
      selectableListId={dropdownId}
      selectableItemIdArray={selectableItemIdArray}
    >
      <SelectableListItem
        itemId="change-node-type"
        onEnter={handleChangeNodeType}
      >
        <MenuItem
          focused={selectedItemId === 'change-node-type'}
          onClick={handleChangeNodeType}
          text={t`Change node type`}
          LeftIcon={IconPencil}
        />
      </SelectableListItem>
      {stepId !== TRIGGER_STEP_ID && (
        <SelectableListItem itemId="duplicate" onEnter={handleDuplicateNode}>
          <MenuItem
            focused={selectedItemId === 'duplicate'}
            onClick={handleDuplicateNode}
            text={t`Duplicate node`}
            LeftIcon={IconCopyPlus}
          />
        </SelectableListItem>
      )}
      {!shouldPinDeleteButton && (
        <SelectableListItem itemId="delete" onEnter={handleDeleteNode}>
          <MenuItem
            focused={selectedItemId === 'delete'}
            onClick={handleDeleteNode}
            text={t`Delete node`}
            LeftIcon={IconTrash}
          />
        </SelectableListItem>
      )}
    </OptionsDropdownMenu>
  );

  const deleteButton = (
    <Button
      size="small"
      title={t`Delete`}
      onClick={() => {
        deleteStep(stepId);
      }}
      Icon={IconTrash}
      accent="danger"
      inverted
    />
  );

  return (
    <RightDrawerFooter
      actions={[
        OptionsDropdown,
        ...(additionalActions ?? []),
        ...(shouldPinDeleteButton ? [deleteButton] : []),
      ]}
    />
  );
};
