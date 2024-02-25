import { useEffect, useState } from 'react';
import { MenuItemMultiSelect } from 'tsup.ui.index';

import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

import { SelectableOption } from '../types/SelectableOption';

export const MultipleOptionSelectDropdown = ({
  optionsToSelect,
  filteredSelectedOptions,
  onChange,
  searchFilter,
}: {
  optionsToSelect: SelectableOption[];
  filteredSelectedOptions: SelectableOption[];
  searchFilter: string;
  onChange: (
    changedOptionToSelect: SelectableOption,
    newSelectedValue: boolean,
  ) => void;
}) => {
  const handleRecordSelectChange = (
    optionToSelect: SelectableOption,
    newSelectedValue: boolean,
  ) => {
    onChange(
      {
        ...optionToSelect,
        isSelected: newSelectedValue,
      },
      newSelectedValue,
    );
  };

  const [optionsInDropdown, setOptionInDropdown] = useState([
    ...(filteredSelectedOptions ?? []),
    ...(optionsToSelect ?? []),
  ]);

  useEffect(() => {
    setOptionInDropdown([
      ...(filteredSelectedOptions ?? []),
      ...(optionsToSelect ?? []),
    ]);
  }, [optionsToSelect, filteredSelectedOptions]);

  const showNoResult =
    optionsToSelect?.length === 0 &&
    searchFilter !== '' &&
    filteredSelectedOptions?.length === 0;
  return (
    <DropdownMenuItemsContainer hasMaxHeight>
      {optionsInDropdown?.map((option) => (
        <MenuItemMultiSelect
          key={option.id}
          selected={option.isSelected}
          onSelectChange={(selected) =>
            handleRecordSelectChange(option, selected)
          }
          text={option.label}
          className=""
        />
      ))}
      {showNoResult && <MenuItem text="No result" />}
    </DropdownMenuItemsContainer>
  );
};
