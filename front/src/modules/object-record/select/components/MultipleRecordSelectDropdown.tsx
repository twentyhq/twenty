import { useEffect, useState } from 'react';

import { RecordToSelect } from '@/object-record/select/types/RecordToSelect';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemMultiSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemMultiSelectAvatar';
import { Avatar } from '@/users/components/Avatar';

export const MultipleRecordSelectDropdown = ({
  recordsToSelect,
  loadingRecords,
  filteredSelectedRecords,
  onChange,
  searchFilter,
}: {
  recordsToSelect: RecordToSelect[];
  filteredSelectedRecords: RecordToSelect[];
  selectedRecords: RecordToSelect[];
  searchFilter: string;
  onChange: (
    changedRecordToSelect: RecordToSelect,
    newSelectedValue: boolean,
  ) => void;
  loadingRecords: boolean;
}) => {
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

  const [recordsInDropdown, setRecordInDropdown] = useState([
    ...(filteredSelectedRecords ?? []),
    ...(recordsToSelect ?? []),
  ]);

  useEffect(() => {
    if (!loadingRecords) {
      setRecordInDropdown([
        ...(filteredSelectedRecords ?? []),
        ...(recordsToSelect ?? []),
      ]);
    }
  }, [recordsToSelect, filteredSelectedRecords, loadingRecords]);

  const showNoResult =
    recordsToSelect?.length === 0 &&
    searchFilter !== '' &&
    filteredSelectedRecords?.length === 0;

  return (
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
  );
};
