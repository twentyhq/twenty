import styled from '@emotion/styled';

import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getSingleRecordPickerSelectableListId } from '@/object-record/record-picker/single-record-picker/utils/getSingleRecordPickerSelectableListId';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

type SingleRecordPickerMenuItemProps = {
  morphItem: RecordPickerPickableMorphItem;
  onMorphItemSelected: (morphItem?: RecordPickerPickableMorphItem) => void;
  isRecordSelected: boolean;
};

const StyledSelectableItem = styled(SelectableListItem)`
  width: 100%;
`;

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

  const isSelectedByKeyboard = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    morphItem.recordId,
    selectableListComponentInstanceId,
  );

  const searchRecord = useRecoilValue(
    searchRecordStoreFamilyState(morphItem.recordId),
  );

  const searchableObjectMetadataItems = useRecoilComponentValue(
    singleRecordPickerSearchableObjectMetadataItemsComponentState,
    recordPickerComponentInstanceId,
  );

  if (!isDefined(searchRecord)) {
    return null;
  }

  const showObjectName = searchableObjectMetadataItems.length > 1;

  return (
    <StyledSelectableItem
      itemId={morphItem.recordId}
      key={morphItem.recordId}
      onEnter={() => {
        onMorphItemSelected(morphItem);
      }}
    >
      <MenuItemSelectAvatar
        testId="menu-item"
        onClick={() => onMorphItemSelected(morphItem)}
        text={searchRecord.label}
        selected={isRecordSelected}
        focused={isSelectedByKeyboard}
        avatar={
          <Avatar
            avatarUrl={searchRecord.imageUrl}
            placeholderColorSeed={morphItem.recordId}
            placeholder={searchRecord.label}
            size="md"
            type={getAvatarType(searchRecord.objectNameSingular) ?? 'rounded'}
          />
        }
        contextualText={
          showObjectName
            ? capitalize(searchRecord.objectNameSingular)
            : undefined
        }
      />
    </StyledSelectableItem>
  );
};
