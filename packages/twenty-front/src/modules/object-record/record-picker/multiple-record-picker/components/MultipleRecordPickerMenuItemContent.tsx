import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, MenuItemMultiSelectAvatar } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsSelectedComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerIsSelectedComponentFamilySelector';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { GlobalSearchRecord } from '~/generated-metadata/graphql';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

type MultipleRecordPickerMenuItemContentProps = {
  searchRecord: GlobalSearchRecord;
  objectMetadataItem: ObjectMetadataItem;
  onChange: (morphItem: RecordPickerPickableMorphItem) => void;
};

export const MultipleRecordPickerMenuItemContent = ({
  searchRecord,
  objectMetadataItem,
  onChange,
}: MultipleRecordPickerMenuItemContentProps) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const selectableListComponentInstanceId =
    getMultipleRecordPickerSelectableListId(componentInstanceId);

  const { isSelectedItemIdSelector } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const isSelectedByKeyboard = useRecoilValue(
    isSelectedItemIdSelector(searchRecord.recordId),
  );

  const isRecordSelectedWithObjectItem = useRecoilComponentFamilyValueV2(
    multipleRecordPickerIsSelectedComponentFamilySelector,
    searchRecord.recordId,
    componentInstanceId,
  );

  const handleSelectChange = (isSelected: boolean) => {
    onChange({
      recordId: searchRecord.recordId,
      objectMetadataId: objectMetadataItem.id,
      isSelected,
      isMatchingSearchFilter: true,
    });
  };

  return (
    <StyledSelectableItem
      itemId={searchRecord.recordId}
      key={searchRecord.recordId}
    >
      <MenuItemMultiSelectAvatar
        onSelectChange={(isSelected) => handleSelectChange(isSelected)}
        isKeySelected={isSelectedByKeyboard}
        selected={isRecordSelectedWithObjectItem}
        avatar={
          <Avatar
            avatarUrl={searchRecord.imageUrl}
            placeholderColorSeed={searchRecord.recordId}
            placeholder={searchRecord.label}
            size="md"
            type={getAvatarType(objectMetadataItem.nameSingular) ?? 'rounded'}
          />
        }
        text={searchRecord.label}
      />
    </StyledSelectableItem>
  );
};
