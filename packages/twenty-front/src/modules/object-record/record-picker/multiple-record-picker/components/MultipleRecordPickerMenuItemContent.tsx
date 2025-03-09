import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, MenuItemMultiSelectAvatar } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsSelectedComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerIsSelectedComponentFamilySelector';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { isDefined } from 'twenty-shared';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

type MultipleRecordPickerMenuItemContentProps = {
  record: ObjectRecord;
  objectMetadataItem: ObjectMetadataItem;
  onChange: (morphItem: RecordPickerPickableMorphItem) => void;
};

export const MultipleRecordPickerMenuItemContent = ({
  record,
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
    isSelectedItemIdSelector(record.id),
  );

  const isRecordSelectedWithObjectItem = useRecoilComponentFamilyValueV2(
    multipleRecordPickerIsSelectedComponentFamilySelector,
    record.id,
    componentInstanceId,
  );

  const handleSelectChange = (isSelected: boolean) => {
    onChange({
      recordId: record.id,
      objectMetadataId: objectMetadataItem.id,
      isSelected,
      isMatchingSearchFilter: true,
    });
  };

  const recordIdentifier = getObjectRecordIdentifier({
    objectMetadataItem,
    record,
  });

  if (!isDefined(recordIdentifier)) {
    return null;
  }

  return (
    <StyledSelectableItem itemId={record.id} key={record.id}>
      <MenuItemMultiSelectAvatar
        onSelectChange={(isSelected) => handleSelectChange(isSelected)}
        isKeySelected={isSelectedByKeyboard}
        selected={isRecordSelectedWithObjectItem}
        avatar={
          <Avatar
            avatarUrl={recordIdentifier.avatarUrl}
            placeholderColorSeed={record.id}
            placeholder={recordIdentifier.name}
            size="md"
            type={recordIdentifier.avatarType ?? 'rounded'}
          />
        }
        text={recordIdentifier.name}
      />
    </StyledSelectableItem>
  );
};
