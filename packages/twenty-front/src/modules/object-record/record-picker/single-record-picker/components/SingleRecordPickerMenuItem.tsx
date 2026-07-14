import { useMemo } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getSingleRecordPickerSelectableListId } from '@/object-record/record-picker/single-record-picker/utils/getSingleRecordPickerSelectableListId';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SingleRecordPickerMenuItemProps = {
  morphItem: RecordPickerPickableMorphItem;
  onMorphItemSelected: (morphItem?: RecordPickerPickableMorphItem) => void;
  isRecordSelected: boolean;
};

export const SingleRecordPickerMenuItem = ({
  morphItem,
  onMorphItemSelected,
  isRecordSelected,
}: SingleRecordPickerMenuItemProps) => {
  const recordPickerComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      SingleRecordPickerComponentInstanceContext,
    );

  const selectableListComponentInstanceId =
    getSingleRecordPickerSelectableListId(recordPickerComponentInstanceId);

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    morphItem.recordId,
    selectableListComponentInstanceId,
  );

  const searchRecordStore = useAtomFamilyStateValue(
    searchRecordStoreFamilyState,
    morphItem.recordId,
  );

  const singleRecordPickerSearchableObjectMetadataItems =
    useAtomComponentStateValue(
      singleRecordPickerSearchableObjectMetadataItemsComponentState,
      recordPickerComponentInstanceId,
    );

  const objectMetadataItem = useMemo(
    () =>
      singleRecordPickerSearchableObjectMetadataItems.find(
        (searchableObjectMetadataItem: EnrichedObjectMetadataItem) =>
          searchableObjectMetadataItem.id === morphItem.objectMetadataId,
      ),
    [
      singleRecordPickerSearchableObjectMetadataItems,
      morphItem.objectMetadataId,
    ],
  );

  if (!isDefined(searchRecordStore)) {
    return null;
  }

  const showObjectName =
    singleRecordPickerSearchableObjectMetadataItems.length > 1;

  return (
    <SelectableListItem
      itemId={morphItem.recordId}
      key={morphItem.recordId}
      onEnter={() => {
        onMorphItemSelected(morphItem);
      }}
    >
      <MenuItemSelectAvatar
        testId="menu-item"
        onClick={() => onMorphItemSelected(morphItem)}
        text={searchRecordStore.label}
        selected={isRecordSelected}
        focused={isSelectedItemId}
        avatar={
          <Avatar
            avatarUrl={getAbsoluteImageUrl(searchRecordStore.imageUrl)}
            placeholderColorSeed={morphItem.recordId}
            placeholder={searchRecordStore.label}
            size="md"
            type={getAvatarType(objectMetadataItem)}
          />
        }
        contextualText={
          showObjectName
            ? capitalize(searchRecordStore.objectLabelSingular)
            : undefined
        }
      />
    </SelectableListItem>
  );
};
