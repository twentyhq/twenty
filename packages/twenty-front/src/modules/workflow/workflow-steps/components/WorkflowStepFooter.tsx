import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { useDuplicateStep } from '@/workflow/workflow-steps/hooks/useDuplicateStep';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { IconCopyPlus, IconPencil, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { getOsControlSymbol } from 'twenty-ui/utilities';

export const WorkflowStepFooter = ({
  stepId,
  additionalActions,
}: {
  stepId: string;
  additionalActions?: React.ReactNode[];
}) => {
  const dropdownId = useId();
  const { t } = useLingui();
  const theme = useTheme();
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

  const OptionsDropdown = (
    <Dropdown
      dropdownId={dropdownId}
      data-select-disable
      clickableComponent={
        <Button title="Options" hotkeys={[getOsControlSymbol(), 'O']} />
      }
      dropdownPlacement="top-end"
      dropdownOffset={{ y: parseInt(theme.spacing(2), 10) }}
      globalHotkeysConfig={{
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      }}
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <SelectableList
              selectableListInstanceId={dropdownId}
              focusId={dropdownId}
              selectableItemIdArray={['change-node-type', 'duplicate']}
            >
              <MenuItem
                onClick={() => {
                  closeDropdown(dropdownId);
                  stepId === TRIGGER_STEP_ID
                    ? openWorkflowTriggerTypeInCommandMenu(workflowId)
                    : openWorkflowEditStepTypeInCommandMenu(workflowId);
                }}
                text={t`Change node type`}
                LeftIcon={IconPencil}
              />
              {stepId !== TRIGGER_STEP_ID && (
                <MenuItem
                  onClick={() => {
                    closeDropdown(dropdownId);
                    duplicateStep({ stepId });
                  }}
                  text={t`Duplicate node`}
                  LeftIcon={IconCopyPlus}
                />
              )}
              {!shouldPinDeleteButton && (
                <MenuItem
                  onClick={() => {
                    closeDropdown(dropdownId);
                    deleteStep(stepId);
                  }}
                  text={t`Delete node`}
                  LeftIcon={IconTrash}
                />
              )}
            </SelectableList>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );

  const deleteButton = (
    <Button
      title="Delete"
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
