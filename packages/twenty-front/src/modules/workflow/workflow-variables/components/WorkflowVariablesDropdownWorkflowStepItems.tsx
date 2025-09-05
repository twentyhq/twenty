import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { type StepOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import { useState } from 'react';
import { IconX, OverflowingTextWithTooltip, useIcons } from 'twenty-ui/display';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowVariablesDropdownWorkflowStepItemsProps = {
  dropdownId: string;
  steps: StepOutputSchema[];
  onSelect: (value: string) => void;
};

export const WorkflowVariablesDropdownWorkflowStepItems = ({
  dropdownId,
  steps,
  onSelect,
}: WorkflowVariablesDropdownWorkflowStepItemsProps) => {
  const { getIcon } = useIcons();
  const [searchInputValue, setSearchInputValue] = useState('');

  const { closeDropdown } = useCloseDropdown();

  const availableSteps = steps.filter((step) =>
    searchInputValue
      ? step.name.toLowerCase().includes(searchInputValue)
      : true,
  );

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => closeDropdown(dropdownId)}
            Icon={IconX}
          />
        }
      >
        <OverflowingTextWithTooltip text="Select Step" />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {availableSteps.length > 0 ? (
          availableSteps.map((item, _index) => (
            <MenuItemSelect
              key={`step-${item.id}`}
              selected={false}
              focused={false}
              onClick={() => onSelect(item.id)}
              text={item.name}
              LeftIcon={item.icon ? getIcon(item.icon) : undefined}
              hasSubMenu
            />
          ))
        ) : (
          <MenuItem
            key="no-steps"
            onClick={() => {}}
            text="No variables available"
            LeftIcon={undefined}
            hasSubMenu={false}
          />
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
