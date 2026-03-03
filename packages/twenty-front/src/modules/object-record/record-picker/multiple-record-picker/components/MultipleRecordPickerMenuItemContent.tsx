import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsSelectedComponentFamilySelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerIsSelectedComponentFamilySelector';
import { getMultipleRecordPickerSelectableListId } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerSelectableListId';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { capitalize } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import { MenuItemMultiSelectAvatar } from 'twenty-ui/navigation';

import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type SearchRecord } from '~/generated/graphql';

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

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    searchRecord.recordId,
    selectableListComponentInstanceId,
  );

  const isRecordSelectedWithObjectItem = useAtomComponentFamilySelectorValue(
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

  const labelSingular = objectMetadataItem.labelSingular;
  const displayText =
    searchRecord.label?.trim() || t`Untitled ${labelSingular}`;

  const multipleRecordPickerSearchableObjectMetadataItems =
    useAtomComponentStateValue(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState,
      componentInstanceId,
    );

  const showObjectName =
    multipleRecordPickerSearchableObjectMetadataItems.length > 1;

  return (
    <StyledSelectableItem
      itemId={searchRecord.recordId}
      key={searchRecord.recordId}
      onEnter={() => handleSelectChange(!isRecordSelectedWithObjectItem)}
    >
      <MenuItemMultiSelectAvatar
        onSelectChange={(isSelected) => handleSelectChange(isSelected)}
        isKeySelected={isSelectedItemId}
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
        contextualText={
          showObjectName
            ? capitalize(objectMetadataItem.labelSingular)
            : undefined
        }
      />
    </StyledSelectableItem>
  );
};
