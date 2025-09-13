import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const visibleRecordFieldsComponentSelector = createComponentSelector({
  key: 'visibleRecordFieldsComponentSelector',
  componentInstanceContext: RecordFieldsComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const currentRecordFields = get(
        currentRecordFieldsComponentState.atomFamily({
          instanceId,
        }),
      );

      const objectMetadataItems = get(objectMetadataItemsState);

      const filteredVisibleAndReadableRecordFields = currentRecordFields.filter(
        (recordFieldToFilter) => {
          if (!recordFieldToFilter.isVisible) {
            return false;
          }

          const objectMetadataItem = objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.fields.some(
                (fieldMetadataItem) =>
                  fieldMetadataItem.id ===
                  recordFieldToFilter.fieldMetadataItemId,
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

          return isActiveFieldMetadataItem({
            objectNameSingular: objectMetadataItem.nameSingular,
            fieldMetadata: fieldMetadataItem,
          });
        },
      );

      return [...filteredVisibleAndReadableRecordFields].sort(
        sortByProperty('position'),
      );
    },
});
