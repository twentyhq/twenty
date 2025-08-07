import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { SingleRecordPickerLoadingEffect } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerLoadingEffect';
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
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';

export type SingleRecordPickerMenuItemsWithSearchProps = {
  excludedRecordIds?: string[];
  onCreate?: ((searchInput?: string) => void) | (() => void);
  objectNameSingular: string;
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

export const SingleRecordPickerMenuItemsWithSearch = ({
  EmptyIcon,
  emptyLabel,
  excludedRecordIds,
  onCancel,
  onCreate,
  onRecordSelected,
  objectNameSingular,
  layoutDirection = 'search-bar-on-top',
  focusId,
}: SingleRecordPickerMenuItemsWithSearchProps) => {
  const { handleSearchFilterChange } = useSingleRecordPickerSearch();

  const recordPickerInstanceId = useAvailableComponentInstanceIdOrThrow(
    SingleRecordPickerComponentInstanceContext,
  );

  const recordPickerSearchFilter = useRecoilComponentValue(
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

  const handleCreateNew = () => {
    onCreate?.(recordPickerSearchFilter);
  };

  return (
    <>
      <SingleRecordPickerLoadingEffect loading={records.loading} />
      {layoutDirection === 'search-bar-on-bottom' && (
        <>
          {isDefined(onCreate) && hasObjectUpdatePermissions && (
            <>
              <DropdownMenuItemsContainer scrollable={false}>
                <CreateNewButton
                  onClick={handleCreateNew}
                  LeftIcon={IconPlus}
                  text="Add New"
                />
              </DropdownMenuItemsContainer>
              <DropdownMenuSeparator />
            </>
          )}

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
          {isDefined(onCreate) && hasObjectUpdatePermissions && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer scrollable={false}>
                <CreateNewButton
                  onClick={handleCreateNew}
                  LeftIcon={IconPlus}
                  text="Add New"
                />
              </DropdownMenuItemsContainer>
            </>
          )}
        </>
      )}
    </>
  );
};
