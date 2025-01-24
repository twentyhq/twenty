import {
  SingleRecordSelectMenuItems,
  SingleRecordSelectMenuItemsProps,
} from '@/object-record/relation-picker/components/SingleRecordSelectMenuItems';
import { useRecordPickerRecordsOptions } from '@/object-record/relation-picker/hooks/useRecordPickerRecordsOptions';
import { useRecordSelectSearch } from '@/object-record/relation-picker/hooks/useRecordSelectSearch';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { Placement } from '@floating-ui/react';
import { IconPlus } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export type SingleRecordSelectMenuItemsWithSearchProps = {
  excludedRecordIds?: string[];
  onCreate?: ((searchInput?: string) => void) | (() => void);
  objectNameSingular: string;
  recordPickerInstanceId?: string;
  selectedRecordIds: string[];
  dropdownPlacement?: Placement | null;
} & Pick<
  SingleRecordSelectMenuItemsProps,
  | 'EmptyIcon'
  | 'emptyLabel'
  | 'onCancel'
  | 'onRecordSelected'
  | 'selectedRecord'
>;

export const SingleRecordSelectMenuItemsWithSearch = ({
  EmptyIcon,
  emptyLabel,
  excludedRecordIds,
  onCancel,
  onCreate,
  onRecordSelected,
  objectNameSingular,
  selectedRecordIds,
  dropdownPlacement,
}: SingleRecordSelectMenuItemsWithSearchProps) => {
  const { handleSearchFilterChange } = useRecordSelectSearch();

  const recordPickerInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
  );

  const { records, recordPickerSearchFilter } = useRecordPickerRecordsOptions({
    objectNameSingular,
    selectedRecordIds,
    excludedRecordIds,
  });

  const createNewButton = isDefined(onCreate) && (
    <CreateNewButton
      onClick={() => onCreate?.(recordPickerSearchFilter)}
      LeftIcon={IconPlus}
      text="Add New"
    />
  );

  const shouldDisplayDropdownMenuItems =
    records.recordsToSelect.length + records.selectedRecords?.length > 0;

  return (
    <>
      {dropdownPlacement?.includes('end') && (
        <>
          <DropdownMenuItemsContainer scrollable={false}>
            {createNewButton}
          </DropdownMenuItemsContainer>
          {records.recordsToSelect.length > 0 && <DropdownMenuSeparator />}
          {shouldDisplayDropdownMenuItems && (
            <SingleRecordSelectMenuItems
              recordsToSelect={records.recordsToSelect}
              loading={records.loading}
              selectedRecord={records.selectedRecords?.[0]}
              shouldSelectEmptyOption={selectedRecordIds?.length === 0}
              hotkeyScope={recordPickerInstanceId}
              isFiltered={!!recordPickerSearchFilter}
              {...{
                EmptyIcon,
                emptyLabel,
                onCancel,
                onRecordSelected,
              }}
            />
          )}
          <DropdownMenuSeparator />
        </>
      )}
      <DropdownMenuSearchInput
        onChange={handleSearchFilterChange}
        autoFocus
        role="combobox"
      />
      {(dropdownPlacement?.includes('start') ||
        isUndefinedOrNull(dropdownPlacement)) && (
        <>
          <DropdownMenuSeparator />
          {shouldDisplayDropdownMenuItems && (
            <SingleRecordSelectMenuItems
              recordsToSelect={records.recordsToSelect}
              loading={records.loading}
              selectedRecord={records.selectedRecords?.[0]}
              shouldSelectEmptyOption={selectedRecordIds?.length === 0}
              hotkeyScope={recordPickerInstanceId}
              isFiltered={!!recordPickerSearchFilter}
              {...{
                EmptyIcon,
                emptyLabel,
                onCancel,
                onRecordSelected,
              }}
            />
          )}
          {records.recordsToSelect.length > 0 && isDefined(onCreate) && (
            <DropdownMenuSeparator />
          )}
          {isDefined(onCreate) && (
            <DropdownMenuItemsContainer scrollable={false}>
              {createNewButton}
            </DropdownMenuItemsContainer>
          )}
        </>
      )}
    </>
  );
};
