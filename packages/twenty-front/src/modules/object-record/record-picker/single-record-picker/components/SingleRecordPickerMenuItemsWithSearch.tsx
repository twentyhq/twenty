import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { SingleRecordPickerLoadingEffect } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerLoadingEffect';
import {
  SingleRecordPickerMenuItems,
  type SingleRecordPickerMenuItemsProps,
} from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItems';
import { useSingleRecordPickerRecords } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerRecords';
import { useSingleRecordPickerSearch } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerSearch';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { type RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
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
  objectNameSingulars: string[];
  recordPickerInstanceId?: string;
  layoutDirection?: RecordPickerLayoutDirection;
  focusId: string;
} & Pick<
  SingleRecordPickerMenuItemsProps,
  | 'EmptyIcon'
  | 'emptyLabel'
  | 'onCancel'
  | 'onMorphItemSelected'
  | 'showObjectName'
>;

export const SingleRecordPickerMenuItemsWithSearch = ({
  EmptyIcon,
  emptyLabel,
  excludedRecordIds,
  onCancel,
  onCreate,
  onMorphItemSelected,
  objectNameSingulars,
  layoutDirection = 'search-bar-on-top',
  focusId,
  showObjectName,
}: SingleRecordPickerMenuItemsWithSearchProps) => {
  const { handleSearchFilterChange } = useSingleRecordPickerSearch();

  const recordPickerInstanceId = useAvailableComponentInstanceIdOrThrow(
    SingleRecordPickerComponentInstanceContext,
  );

  const recordPickerSearchFilter = useRecoilComponentValue(
    singleRecordPickerSearchFilterComponentState,
    recordPickerInstanceId,
  );

  const { pickableMorphItems, loading } = useSingleRecordPickerRecords({
    objectNameSingulars,
    excludedRecordIds,
  });

  const { objectMetadataItems: allObjectMetadataItems } =
    useObjectMetadataItems();
  const objectMetadataItems = allObjectMetadataItems.filter(
    (objectMetadataItem) =>
      objectNameSingulars.includes(objectMetadataItem.nameSingular),
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const hasUpdatePermissions = objectMetadataItems.every(
    (objectMetadataItem) =>
      objectPermissionsByObjectMetadataId[objectMetadataItem.id]
        ?.canUpdateObjectRecords,
  );

  const handleCreateNew = () => {
    onCreate?.(recordPickerSearchFilter);
  };

  return (
    <>
      <SingleRecordPickerLoadingEffect loading={loading} />
      {layoutDirection === 'search-bar-on-bottom' && (
        <>
          {isDefined(onCreate) && hasUpdatePermissions && (
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
              pickableMorphItems={pickableMorphItems}
              onMorphItemSelected={onMorphItemSelected}
              {...{
                EmptyIcon,
                emptyLabel,
                onCancel,
                showObjectName,
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
              pickableMorphItems={pickableMorphItems}
              onMorphItemSelected={onMorphItemSelected}
              {...{
                EmptyIcon,
                emptyLabel,
                onCancel,
                showObjectName,
              }}
            />
          </DropdownMenuItemsContainer>
          {isDefined(onCreate) && hasUpdatePermissions && (
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
