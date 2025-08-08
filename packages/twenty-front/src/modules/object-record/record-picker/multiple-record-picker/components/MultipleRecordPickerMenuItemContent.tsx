import styled from '@emotion/styled';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsSelectedComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerIsSelectedComponentFamilySelector';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { Avatar } from 'twenty-ui/display';
import { MenuItemMultiSelectAvatar } from 'twenty-ui/navigation';
import { SearchRecord } from '~/generated-metadata/graphql';

export const StyledSelectableItem = styled(SelectableListItem)`
  height: 100%;
  width: 100%;
`;

type MultipleRecordPickerMenuItemContentProps = {
  searchRecord: SearchRecord;
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

  const isSelectedByKeyboard = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    searchRecord.recordId,
    selectableListComponentInstanceId,
  );

  const isRecordSelectedWithObjectItem = useRecoilComponentFamilyValue(
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

  const displayText =
    searchRecord.label?.trim() ||
    `Untitled ${objectMetadataItem.labelSingular}`;

  return (
    <StyledSelectableItem
      itemId={searchRecord.recordId}
      key={searchRecord.recordId}
      onEnter={() => handleSelectChange(!isRecordSelectedWithObjectItem)}
    >
      <MenuItemMultiSelectAvatar
        onSelectChange={(isSelected) => handleSelectChange(isSelected)}
        isKeySelected={isSelectedByKeyboard}
        selected={isRecordSelectedWithObjectItem}
        avatar={
          <Avatar
            avatarUrl={searchRecord.imageUrl}
            placeholderColorSeed={searchRecord.recordId}
            placeholder={displayText}
            size="md"
            type={getAvatarType(objectMetadataItem.nameSingular) ?? 'rounded'}
          />
        }
        text={displayText}
      />
    </StyledSelectableItem>
  );
};
