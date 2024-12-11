import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { StepOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';
import { useTheme } from '@emotion/react';
import { useState } from 'react';
import {
  HorizontalSeparator,
  IconX,
  MenuItem,
  MenuItemSelect,
  OverflowingTextWithTooltip,
} from 'twenty-ui';

type SearchVariablesDropdownWorkflowStepItemsProps = {
  dropdownId: string;
  steps: StepOutputSchema[];
  onSelect: (value: string) => void;
};

export const SearchVariablesDropdownWorkflowStepItems = ({
  dropdownId,
  steps,
  onSelect,
}: SearchVariablesDropdownWorkflowStepItemsProps) => {
  const theme = useTheme();
  const [searchInputValue, setSearchInputValue] = useState('');

  const { closeDropdown } = useDropdown(dropdownId);

  const availableSteps = steps.filter((step) =>
    searchInputValue
      ? step.name.toLowerCase().includes(searchInputValue)
      : true,
  );

  return (
    <>
      <DropdownMenuHeader StartIcon={IconX} onClick={closeDropdown}>
        <OverflowingTextWithTooltip text={'Select Step'} />
      </DropdownMenuHeader>
      <HorizontalSeparator
        color={theme.background.transparent.primary}
        noMargin
      />
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      <HorizontalSeparator
        color={theme.background.transparent.primary}
        noMargin
      />
      {availableSteps.length > 0 ? (
        availableSteps.map((item, _index) => (
          <MenuItemSelect
            key={`step-${item.id}`}
            selected={false}
            hovered={false}
            onClick={() => onSelect(item.id)}
            text={item.name}
            LeftIcon={undefined}
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
    </>
  );
};
