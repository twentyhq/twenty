import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { createElement, useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type TagColor, Tag } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

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

  const optionsToSelect = useMemo(() => {
    const searchTerm = normalizeSearchText(searchFilter);
    return options.filter((option) => {
      return (
        option.value !== selectedOption?.value &&
        normalizeSearchText(option.label).includes(searchTerm)
      );
    });
  }, [options, searchFilter, selectedOption?.value]);

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
    <DropdownContent ref={containerRef}>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {optionsInDropDown.map((option) => (
          <ListItem
            key={option.value}
            onClick={() => handleOptionChange(option)}
            role="option"
            aria-selected={selectedOption?.value === option.value}
            selected={selectedOption?.value === option.value}
            indicator="check"
          >
            <Tag
              color={(option.color as TagColor) ?? 'transparent'}
              borderStyle="dashed"
              variant={'soft'}
              startIcon={
                isDefined(option.Icon) ? createElement(option.Icon) : undefined
              }
            >
              {option.label}
            </Tag>
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
