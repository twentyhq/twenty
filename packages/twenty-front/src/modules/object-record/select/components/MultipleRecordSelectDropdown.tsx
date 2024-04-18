import { useEffect, useState } from 'react';
import { Avatar } from 'twenty-ui';

import { SelectableRecord } from '@/object-record/select/types/SelectableRecord';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemMultiSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemMultiSelectAvatar';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export const MultipleRecordSelectDropdown = ({
  recordsToSelect,
  loadingRecords,
  filteredSelectedRecords,
  onChange,
  searchFilter,
}: {
  recordsToSelect: SelectableRecord[];
  filteredSelectedRecords: SelectableRecord[];
  selectedRecords: SelectableRecord[];
  searchFilter: string;
  onChange: (
    changedRecordToSelect: SelectableRecord,
    newSelectedValue: boolean,
  ) => void;
  loadingRecords: boolean;
}) => {
  const handleRecordSelectChange = (
    recordToSelect: SelectableRecord,
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
    filteredSelectedRecords?.length === 0 &&
    !loadingRecords;

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
              avatarUrl={getImageAbsoluteURIOrBase64(record.avatarUrl)}
              entityId={record.id}
              placeholder={record.name}
              size="md"
              type={record.avatarType ?? 'rounded'}
            />
          }
          text={record.name}
        />
      ))}
      {showNoResult && <MenuItem text="No result" />}
      {loadingRecords && <DropdownMenuSkeletonItem />}
    </DropdownMenuItemsContainer>
  );
};
