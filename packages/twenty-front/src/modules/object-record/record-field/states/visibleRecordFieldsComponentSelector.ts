import { flattenedReadableFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedReadableFieldMetadataItemIdsSelector';
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

      const readableFieldMetadataItems = get(
        flattenedReadableFieldMetadataItemsSelector,
      );

      const filteredVisibleAndReadableRecordFields = currentRecordFields.filter(
        (recordFieldToFilter) =>
          recordFieldToFilter.isVisible === true &&
          readableFieldMetadataItems.some(
            (fieldMetadataItemToFilter) =>
              fieldMetadataItemToFilter.id ===
                recordFieldToFilter.fieldMetadataItemId &&
              fieldMetadataItemToFilter.isActive === true &&
              fieldMetadataItemToFilter.isSystem !== true,
          ),
      );

      return [...filteredVisibleAndReadableRecordFields].sort(
        sortByProperty('position'),
      );
    },
});
