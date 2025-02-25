import {
  SingleRecordPickerMenuItems,
  SingleRecordPickerMenuItemsProps,
} from '@/object-record/record-picker/components/SingleRecordPickerMenuItems';
import { useRecordPickerRecordsOptions } from '@/object-record/record-picker/hooks/useRecordPickerRecordsOptions';
import { useRecordSelectSearch } from '@/object-record/record-picker/hooks/useRecordSelectSearch';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { recordPickerSearchFilterComponentState } from '@/object-record/record-picker/states/recordPickerSearchFilterComponentState';
import { useHasObjectReadOnlyPermission } from '@/settings/roles/hooks/useHasObjectReadOnlyPermission';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Placement } from '@floating-ui/react';
import { isDefined } from 'twenty-shared';
import { IconPlus } from 'twenty-ui';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export type SingleRecordPickerMenuItemsWithSearchProps = {
  excludedRecordIds?: string[];
  onCreate?: ((searchInput?: string) => void) | (() => void);
  objectNameSingular: string;
  recordPickerInstanceId?: string;
  selectedRecordIds: string[];
  dropdownPlacement?: Placement | null;
} & Pick<
  SingleRecordPickerMenuItemsProps,
  | 'EmptyIcon'
  | 'emptyLabel'
  | 'onCancel'
  | 'onRecordSelected'
  | 'selectedRecord'
>;

export const SingleRecordPickerMenuItemsWithSearch = ({
  EmptyIcon,
  emptyLabel,
  excludedRecordIds,
  onCancel,
  onCreate,
  onRecordSelected,
  objectNameSingular,
  selectedRecordIds,
  dropdownPlacement,
}: SingleRecordPickerMenuItemsWithSearchProps) => {
  const { handleSearchFilterChange } = useRecordSelectSearch();

  const recordPickerInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
  );

  const hasObjectReadOnlyPermission = useHasObjectReadOnlyPermission();

  const recordPickerSearchFilter = useRecoilComponentValueV2(
    recordPickerSearchFilterComponentState,
    recordPickerInstanceId,
  );

  const { records } = useRecordPickerRecordsOptions({
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
          {isDefined(onCreate) && !hasObjectReadOnlyPermission && (
            <DropdownMenuItemsContainer scrollable={false}>
              {createNewButton}
            </DropdownMenuItemsContainer>
          )}
          {records.recordsToSelect.length > 0 && <DropdownMenuSeparator />}
          {shouldDisplayDropdownMenuItems && (
            <SingleRecordPickerMenuItems
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
            <SingleRecordPickerMenuItems
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
          {isDefined(onCreate) && !hasObjectReadOnlyPermission && (
            <DropdownMenuItemsContainer scrollable={false}>
              {createNewButton}
            </DropdownMenuItemsContainer>
          )}
        </>
      )}
    </>
  );
};
