import { type ChangeEvent } from 'react';

import { ObjectFilterDropdownRecordPinnedItems } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownRecordPinnedItems';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type FormWorkspaceMemberFilterValueInputDropdownContentProps = {
  dropdownId: string;
  selectableListId: string;
  searchFilter: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  pinnedSelectableItems: SelectableItem[];
  recordsToSelect: SelectableItem[];
  filteredSelectedRecords: SelectableItem[];
  selectedRecords: SelectableItem[];
  loading: boolean;
  onSelectChange: (item: SelectableItem, isNewSelectedValue: boolean) => void;
};

export const FormWorkspaceMemberFilterValueInputDropdownContent = ({
  dropdownId,
  selectableListId,
  searchFilter,
  onSearchChange,
  pinnedSelectableItems,
  recordsToSelect,
  filteredSelectedRecords,
  selectedRecords,
  loading,
  onSelectChange,
}: FormWorkspaceMemberFilterValueInputDropdownContentProps) => (
  <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
    <DropdownMenuSearchInput
      autoFocus
      type="text"
      value={searchFilter}
      onChange={onSearchChange}
    />
    <DropdownMenuSeparator />
    {pinnedSelectableItems.length > 0 && (
      <>
        <ObjectFilterDropdownRecordPinnedItems
          selectableItems={pinnedSelectableItems}
          onChange={onSelectChange}
        />
        <DropdownMenuSeparator />
      </>
    )}
    <MultipleSelectDropdown
      selectableListId={selectableListId}
      focusId={dropdownId}
      itemsToSelect={recordsToSelect}
      filteredSelectedItems={filteredSelectedRecords}
      selectedItems={selectedRecords}
      onChange={onSelectChange}
      searchFilter={searchFilter}
      loadingItems={loading}
    />
  </DropdownContent>
);
