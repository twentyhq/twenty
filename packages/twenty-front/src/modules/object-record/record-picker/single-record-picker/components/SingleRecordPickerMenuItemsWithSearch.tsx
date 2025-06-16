import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import {
  SingleRecordPickerMenuItems,
  SingleRecordPickerMenuItemsProps,
} from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItems';
import { useSingleRecordPickerRecords } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerRecords';
import { useSingleRecordPickerSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';

export type SingleRecordPickerMenuItemsWithSearchProps = {
  excludedRecordIds?: string[];
  onCreate?: ((searchInput?: string) => void) | (() => void);
  objectNameSingular: string;
  recordPickerInstanceId?: string;
  layoutDirection?: RecordPickerLayoutDirection;
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
  layoutDirection = 'search-bar-on-top',
}: SingleRecordPickerMenuItemsWithSearchProps) => {
  const { handleSearchFilterChange } = useSingleRecordPickerSearch();

  const recordPickerInstanceId = useAvailableComponentInstanceIdOrThrow(
    SingleRecordPickerComponentInstanceContext,
  );

  const recordPickerSearchFilter = useRecoilComponentValueV2(
    singleRecordPickerSearchFilterComponentState,
    recordPickerInstanceId,
  );

  const { records } = useSingleRecordPickerRecords({
    objectNameSingular,
    excludedRecordIds,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const createNewButton = isDefined(onCreate) && (
    <CreateNewButton
      onClick={() => onCreate?.(recordPickerSearchFilter)}
      LeftIcon={IconPlus}
      text="Add New"
    />
  );

  return (
    <>
      {layoutDirection === 'search-bar-on-bottom' && (
        <>
          {isDefined(onCreate) && hasObjectUpdatePermissions && (
            <DropdownMenuItemsContainer scrollable={false}>
              {createNewButton}
            </DropdownMenuItemsContainer>
          )}
          {records.recordsToSelect.length > 0 && <DropdownMenuSeparator />}
          <SingleRecordPickerMenuItems
            recordsToSelect={records.recordsToSelect}
            loading={records.loading}
            selectedRecord={records.selectedRecords?.[0]}
            isFiltered={!!recordPickerSearchFilter}
            {...{
              EmptyIcon,
              emptyLabel,
              onCancel,
              onRecordSelected,
            }}
          />
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
          <SingleRecordPickerMenuItems
            recordsToSelect={records.recordsToSelect}
            loading={records.loading}
            selectedRecord={records.selectedRecords?.[0]}
            isFiltered={!!recordPickerSearchFilter}
            {...{
              EmptyIcon,
              emptyLabel,
              onCancel,
              onRecordSelected,
            }}
          />
          {records.recordsToSelect.length > 0 && isDefined(onCreate) && (
            <DropdownMenuSeparator />
          )}
          {isDefined(onCreate) && hasObjectUpdatePermissions && (
            <DropdownMenuItemsContainer scrollable={false}>
              {createNewButton}
            </DropdownMenuItemsContainer>
          )}
        </>
      )}
    </>
  );
};
