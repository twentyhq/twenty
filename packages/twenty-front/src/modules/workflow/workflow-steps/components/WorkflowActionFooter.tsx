import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useCommandMenuWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useCommandMenuWorkflowIdOrThrow';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useDuplicateStep } from '@/workflow/workflow-steps/hooks/useDuplicateStep';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { IconCopyPlus, IconPencil } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { getOsControlSymbol } from 'twenty-ui/utilities';

export const WorkflowActionFooter = ({
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
  const { openWorkflowEditStepTypeInCommandMenu } = useWorkflowCommandMenu();

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
                  openWorkflowEditStepTypeInCommandMenu(workflowId);
                }}
                text={t`Change node type`}
                LeftIcon={IconPencil}
              />
              <MenuItem
                onClick={() => {
                  closeDropdown(dropdownId);
                  duplicateStep({ stepId });
                }}
                text={t`Duplicate node`}
                LeftIcon={IconCopyPlus}
              />
            </SelectableList>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );

  return (
    <RightDrawerFooter
      actions={[OptionsDropdown, ...(additionalActions ?? [])]}
    />
  );
};
