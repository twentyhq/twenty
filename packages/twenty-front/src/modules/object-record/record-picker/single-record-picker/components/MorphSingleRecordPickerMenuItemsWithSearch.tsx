import { SingleRecordPickerLoadingEffect } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerLoadingEffect';
import {
  SingleRecordPickerMenuItems,
  type SingleRecordPickerMenuItemsProps,
} from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItems';
import { useSingleRecordPickerRecords } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerRecords';
import { useSingleRecordPickerSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerSearch';
import { type RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

export type MorphSingleRecordPickerMenuItemsWithSearchProps = {
  excludedRecordIds?: string[];

  objectNameSingulars: string[];
  recordPickerInstanceId?: string;
  layoutDirection?: RecordPickerLayoutDirection;
  focusId: string;
} & Pick<
  SingleRecordPickerMenuItemsProps,
  | 'EmptyIcon'
  | 'emptyLabel'
  | 'onCancel'
  | 'onRecordSelected'
  | 'selectedRecord'
>;

export const MorphSingleRecordPickerMenuItemsWithSearch = ({
  EmptyIcon,
  emptyLabel,
  excludedRecordIds,
  onCancel,
  onRecordSelected,
  objectNameSingulars,
  layoutDirection = 'search-bar-on-top',
  focusId,
}: MorphSingleRecordPickerMenuItemsWithSearchProps) => {
  const { handleSearchFilterChange } = useSingleRecordPickerSearch();

  const { records } = useSingleRecordPickerRecords({
    objectNameSingulars,
    excludedRecordIds,
  });

  return (
    <>
      <SingleRecordPickerLoadingEffect loading={records.loading} />
      {layoutDirection === 'search-bar-on-bottom' && (
        <>
          <DropdownMenuItemsContainer hasMaxHeight>
            <SingleRecordPickerMenuItems
              focusId={focusId}
              recordsToSelect={records.recordsToSelect}
              selectedRecord={records.selectedRecords?.[0]}
              filteredSelectedRecords={records.filteredSelectedRecords}
              {...{
                EmptyIcon,
                emptyLabel,
                onCancel,
                onRecordSelected,
              }}
            />
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuSearchInput
        onChange={handleSearchFilterChange}
        autoFocus
        role="combobox"
      />
      {layoutDirection === 'search-bar-on-top' && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer hasMaxHeight>
            <SingleRecordPickerMenuItems
              focusId={focusId}
              recordsToSelect={records.recordsToSelect}
              selectedRecord={records.selectedRecords?.[0]}
              filteredSelectedRecords={records.filteredSelectedRecords}
              {...{
                EmptyIcon,
                emptyLabel,
                onCancel,
                onRecordSelected,
              }}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
    </>
  );
};
