import { t } from '@lingui/core/macro';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
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
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type SearchRecord } from '~/generated/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type MultipleRecordPickerMenuItemContentProps = {
  searchRecord: SearchRecord;
  objectMetadataItem: EnrichedObjectMetadataItem;
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
    <SelectableListItem
      itemId={searchRecord.recordId}
      key={searchRecord.recordId}
      onEnter={() => handleSelectChange(!isRecordSelectedWithObjectItem)}
    >
      <ListItem
        focused={isSelectedItemId}
        role="option"
        aria-selected={isRecordSelectedWithObjectItem}
        selected={isRecordSelectedWithObjectItem}
        indicator="checkbox"
        description={
          showObjectName
            ? capitalize(objectMetadataItem.labelSingular)
            : undefined
        }
        onClick={() => handleSelectChange(!isRecordSelectedWithObjectItem)}
        startIcon={
          <Avatar
            src={getAbsoluteImageUrl(searchRecord.imageUrl)}
            colorSeed={searchRecord.recordId}
            name={displayText}
            size="md"
            shape={getAvatarShape(objectMetadataItem)}
          />
        }
      >
        {displayText}
      </ListItem>
    </SelectableListItem>
  );
};
