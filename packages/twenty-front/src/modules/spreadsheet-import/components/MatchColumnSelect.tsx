import React, { useCallback, useState } from 'react';
import { AppTooltip, MenuItem, MenuItemSelect, SelectOption } from 'twenty-ui';
import { ReadonlyDeep } from 'type-fest';
import { useDebouncedCallback } from 'use-debounce';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useLingui } from '@lingui/react/macro';
import { createPortal } from 'react-dom';
import { v4 } from 'uuid';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';

interface MatchColumnSelectProps {
  columnIndex: string;
  onChange: (value: ReadonlyDeep<SelectOption> | null) => void;
  value?: ReadonlyDeep<SelectOption>;
  options: readonly ReadonlyDeep<SelectOption>[];
  placeholder?: string;
}

export const MatchColumnSelect = ({
  onChange,
  value,
  options: initialOptions,
  placeholder,
  columnIndex,
}: MatchColumnSelectProps) => {
  const dropdownId = `match-column-select-dropdown-${columnIndex}`;

  const { closeDropdown } = useDropdown(dropdownId);

  const [searchFilter, setSearchFilter] = useState('');
  const [options, setOptions] = useState(initialOptions);

  const handleSearchFilterChange = useCallback(
    (text: string) => {
      setOptions(
        initialOptions.filter((option) =>
          option.label.toLowerCase().includes(text.toLowerCase()),
        ),
      );
    },
    [initialOptions],
  );

  const debouncedHandleSearchFilter = useDebouncedCallback(
    handleSearchFilterChange,
    100,
    {
      leading: true,
    },
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setSearchFilter(value);
    debouncedHandleSearchFilter(value);
  };

  const handleChange = (option: ReadonlyDeep<SelectOption>) => {
    onChange(option);
    closeDropdown();
  };

  useUpdateEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const { t } = useLingui();

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownHotkeyScope={{
        scope: dropdownId,
      }}
      dropdownPlacement="bottom-start"
      clickableComponent={
        <MenuItem
          LeftIcon={value?.Icon}
          text={value?.label ?? placeholder ?? ''}
          accent={value?.label ? 'default' : 'placeholder'}
        />
      }
      dropdownComponents={
        <>
          <DropdownMenuSearchInput
            value={searchFilter}
            onChange={handleFilterChange}
            autoFocus
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer hasMaxHeight>
            {options?.map((option) => {
              const id = `${v4()}-${option.value}`;
              return (
                <React.Fragment key={id}>
                  <div id={id}>
                    <MenuItemSelect
                      selected={value?.label === option.label}
                      onClick={() => handleChange(option)}
                      disabled={
                        option.disabled && value?.value !== option.value
                      }
                      LeftIcon={option?.Icon}
                      text={option.label}
                    />
                  </div>
                  {option.disabled &&
                    value?.value !== option.value &&
                    createPortal(
                      <AppTooltip
                        key={id}
                        anchorSelect={`#${id}`}
                        content={t`You are already importing this column.`}
                        place="right"
                        offset={-20}
                      />,
                      document.body,
                    )}
                </React.Fragment>
              );
            })}
            {options?.length === 0 && (
              <MenuItem key="No results" text={t`No results`} />
            )}
          </DropdownMenuItemsContainer>
        </>
      }
    />
  );
};
