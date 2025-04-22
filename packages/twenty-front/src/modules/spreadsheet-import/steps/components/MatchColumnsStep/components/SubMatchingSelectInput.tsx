import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useMemo, useRef, useState } from 'react';
import { TagColor } from 'twenty-ui/components';
import { SelectOption } from 'twenty-ui/input';
import { MenuItemSelectTag } from 'twenty-ui/navigation';

interface SubMatchingSelectInputProps {
  onOptionSelected: (selectedOption: SelectOption) => void;
  options: SelectOption[];
  defaultOption?: SelectOption;
}

export const SubMatchingSelectInput = ({
  onOptionSelected,
  options,
  defaultOption,
}: SubMatchingSelectInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | undefined
  >(defaultOption);

  const optionsToSelect = useMemo(
    () =>
      options.filter((option) => {
        return (
          option.value !== selectedOption?.value &&
          option.label.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }) || [],
    [options, searchFilter, selectedOption?.value],
  );

  const optionsInDropDown = useMemo(
    () =>
      selectedOption ? [selectedOption, ...optionsToSelect] : optionsToSelect,
    [optionsToSelect, selectedOption],
  );

  const handleOptionChange = (option: SelectOption) => {
    setSelectedOption(option);
    onOptionSelected(option);
  };

  return (
    <DropdownMenu ref={containerRef} data-select-disable>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {optionsInDropDown.map((option) => (
          <MenuItemSelectTag
            key={option.value}
            selected={selectedOption?.value === option.value}
            text={option.label}
            color={(option.color as TagColor) ?? 'transparent'}
            onClick={() => handleOptionChange(option)}
            LeftIcon={option.Icon}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
