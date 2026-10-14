import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { isDefined } from 'twenty-shared/utils';
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

      const objectMetadataItems = get(objectMetadataItemsSelector);

      return filterVisibleAndReadableRecordFields(
        currentRecordFields,
        objectMetadataItems,
      );
    },
});

type FieldMetadataItemLookup = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const filterVisibleAndReadableRecordFields = (
  currentRecordFields: RecordField[],
  objectMetadataItems: EnrichedObjectMetadataItem[],
): RecordField[] => {
  const lookupByFieldMetadataItemId = new Map<
    string,
    FieldMetadataItemLookup
  >();
  const readableFieldMetadataItemIds = new Set<string>();

  for (const objectMetadataItem of objectMetadataItems) {
    for (const fieldMetadataItem of objectMetadataItem.fields) {
      lookupByFieldMetadataItemId.set(fieldMetadataItem.id, {
        fieldMetadataItem,
        objectMetadataItem,
      });
    }

    for (const readableFieldMetadataItem of objectMetadataItem.readableFields) {
      readableFieldMetadataItemIds.add(readableFieldMetadataItem.id);
    }
  }

  const isActiveAndReadable = (fieldMetadataItemId: string) => {
    const lookup = lookupByFieldMetadataItemId.get(fieldMetadataItemId);

    if (!isDefined(lookup)) {
      return false;
    }

    const { fieldMetadataItem, objectMetadataItem } = lookup;

    const isLabelIdentifier =
      fieldMetadataItem.id ===
      objectMetadataItem.labelIdentifierFieldMetadataId;

    const isActive =
      isLabelIdentifier ||
      isActiveFieldMetadataItem({
        fieldMetadata: fieldMetadataItem,
      });

    return isActive && readableFieldMetadataItemIds.has(fieldMetadataItem.id);
  };

  const filteredVisibleAndReadableRecordFields = currentRecordFields.filter(
    (recordFieldToFilter) => {
      if (!recordFieldToFilter.isVisible) {
        return false;
      }

      if (!isActiveAndReadable(recordFieldToFilter.fieldMetadataItemId)) {
        return false;
      }

      if (
        isDefined(recordFieldToFilter.relationTargetFieldMetadataItemId) &&
        !isActiveAndReadable(
          recordFieldToFilter.relationTargetFieldMetadataItemId,
        )
      ) {
        return false;
      }

      return true;
    },
  );

  return [...filteredVisibleAndReadableRecordFields].sort(
    sortByProperty('position'),
  );
};
