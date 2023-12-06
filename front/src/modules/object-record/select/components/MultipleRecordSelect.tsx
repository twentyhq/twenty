import { useRef } from 'react';
import debounce from 'lodash.debounce';

import { RecordToSelect } from '@/object-record/select/types/RecordToSelect';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemMultiSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemMultiSelectAvatar';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { Avatar } from '@/users/components/Avatar';

export const MultipleRecordSelect = ({
  recordsToSelect,
  filteredSelectedRecords,
  selectedRecords,
  onChange,
  onSubmit,
  onSearchFilterChange,
  searchFilter,
}: {
  recordsToSelect: RecordToSelect[];
  filteredSelectedRecords: RecordToSelect[];
  selectedRecords: RecordToSelect[];
  searchFilter: string;
  onSearchFilterChange: (newSearchFilter: string) => void;
  onChange: (
    changedRecordToSelect: RecordToSelect,
    newSelectedValue: boolean,
  ) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
}) => {
  const debouncedSetSearchFilter = debounce(onSearchFilterChange, 100, {
    leading: true,
  });

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchFilter(event.currentTarget.value);
    onSearchFilterChange(event.currentTarget.value);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const handleRecordSelectChange = (
    recordToSelect: RecordToSelect,
    newSelectedValue: boolean,
  ) => {
    onChange(
      {
        ...recordToSelect,
        isSelected: newSelectedValue,
      },
      newSelectedValue,
    );
  };

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      onSubmit?.();
    },
  });

  const recordsInDropdown = [
    ...(filteredSelectedRecords ?? []),
    ...(recordsToSelect ?? []),
  ];

  const showNoResult =
    recordsToSelect?.length === 0 &&
    searchFilter !== '' &&
    filteredSelectedRecords?.length === 0;

  return (
    <DropdownMenu ref={containerRef} data-select-disable>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {recordsInDropdown?.map((record) => (
          <MenuItemMultiSelectAvatar
            key={record.id}
            selected={record.isSelected}
            onSelectChange={(newCheckedValue) =>
              handleRecordSelectChange(record, newCheckedValue)
            }
            avatar={
              <Avatar
                avatarUrl={record.avatarUrl}
                colorId={record.id}
                placeholder={record.name}
                size="md"
                type={record.avatarType ?? 'rounded'}
              />
            }
            text={record.name}
          />
        ))}
        {showNoResult && <MenuItem text="No result" />}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
