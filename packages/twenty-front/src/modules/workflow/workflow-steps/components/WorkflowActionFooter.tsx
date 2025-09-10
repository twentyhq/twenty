import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useDuplicateStep } from '@/workflow/workflow-steps/hooks/useDuplicateStep';
import { useTheme } from '@emotion/react';
import { useId } from 'react';
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
  const theme = useTheme();
  const { duplicateStep } = useDuplicateStep();
  const { closeDropdown } = useCloseDropdown();

  const OptionsDropdown = () => {
    return (
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
                selectableItemIdArray={['duplicate']}
              >
                <MenuItem
                  onClick={() => {
                    closeDropdown(dropdownId);
                    duplicateStep({ stepId });
                  }}
                  text="Duplicate"
                />
              </SelectableList>
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
    );
  };

  return (
    <RightDrawerFooter
      actions={[
        <OptionsDropdown key="options" />,
        ...(additionalActions ?? []),
      ]}
    />
  );
};
