import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { findById } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const visibleRecordFieldsComponentSelector = createAtomComponentSelector<
  RecordField[]
>({
  key: 'visibleRecordFieldsComponentSelector',
  componentInstanceContext: RecordFieldsComponentInstanceContext,
  get:
    (componentStateKey) =>
    ({ get }) => {
      const currentRecordFields = get(
        currentRecordFieldsComponentState,
        componentStateKey,
      );

      const objectMetadataItems = get(objectMetadataItemsState);

      return filterVisibleAndReadableRecordFields(
        currentRecordFields,
        objectMetadataItems,
      );
    },
});

const filterVisibleAndReadableRecordFields = (
  currentRecordFields: RecordField[],
  objectMetadataItems: ObjectMetadataItem[],
): RecordField[] => {
  const filteredVisibleAndReadableRecordFields = currentRecordFields.filter(
    (recordFieldToFilter) => {
      if (!recordFieldToFilter.isVisible) {
        return false;
      }

      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.fields.some(
            (fieldMetadataItem) =>
              fieldMetadataItem.id === recordFieldToFilter.fieldMetadataItemId,
          ),
      );

      if (!objectMetadataItem) {
        return false;
      }

      const fieldMetadataItem = objectMetadataItem.fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === recordFieldToFilter.fieldMetadataItemId,
      );

      if (!fieldMetadataItem) {
        return false;
      }

      const isLabelIdentifier =
        fieldMetadataItem.id ===
        objectMetadataItem.labelIdentifierFieldMetadataId;

      const isActive =
        isLabelIdentifier ||
        isActiveFieldMetadataItem({
          objectNameSingular: objectMetadataItem.nameSingular,
          fieldMetadata: fieldMetadataItem,
        });

      const isReadable = objectMetadataItem.readableFields.some(
        findById(fieldMetadataItem.id),
      );

      return isReadable && isActive;
    },
  );

  return [...filteredVisibleAndReadableRecordFields].sort(
    sortByProperty('position'),
  );
};
