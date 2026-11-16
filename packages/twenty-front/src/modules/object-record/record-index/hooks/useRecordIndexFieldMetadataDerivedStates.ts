import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { labelIdentifierFieldMetadataItemSelector } from '@/object-metadata/states/labelIdentifierFieldMetadataItemSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useGetRecordFieldAggregateTarget } from '@/object-record/record-column-aggregate/hooks/useGetRecordFieldAggregateTarget';
import { useGetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/hooks/useGetRecordFieldLookupTarget';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { getRecordFieldColumnDescriptor } from '@/object-record/record-field/utils/getRecordFieldColumnDescriptor';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useMemo } from 'react';
import { findById, isDefined } from 'twenty-shared/utils';

export const useRecordIndexFieldMetadataDerivedStates = (
  objectMetadataItem: EnrichedObjectMetadataItem | undefined,
  recordIndexId?: string | undefined,
) => {
  const fieldMetadataItems = objectMetadataItem?.fields ?? [];

  const fieldMetadataItemByFieldMetadataItemId = Object.fromEntries(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
    recordIndexId,
  );

  const recordFieldByFieldMetadataItemId = Object.fromEntries(
    currentRecordFields.map((recordField) => [
      recordField.fieldMetadataItemId,
      recordField,
    ]),
  );

  const fieldDefinitionByFieldMetadataItemId = isDefined(objectMetadataItem)
    ? Object.fromEntries(
        fieldMetadataItems.map((fieldMetadataItem) => [
          fieldMetadataItem.id,
          formatFieldMetadataItemAsColumnDefinition({
            field: fieldMetadataItem,
            objectMetadataItem,
            position:
              recordFieldByFieldMetadataItemId[fieldMetadataItem.id]
                ?.position ?? 0,
            labelWidth:
              recordFieldByFieldMetadataItemId[fieldMetadataItem.id]?.size ?? 0,
          }),
        ]),
      )
    : {};

  const getLookupTarget = useGetRecordFieldLookupTarget();
  const getAggregateTarget = useGetRecordFieldAggregateTarget();
  const filterableFieldMetadataItems = useAtomFamilySelectorValue(
    availableFieldMetadataItemsForFilterFamilySelector,
    { objectMetadataItemId: objectMetadataItem?.id ?? '' },
  );
  const sortableFieldMetadataItems = useAtomFamilySelectorValue(
    availableFieldMetadataItemsForSortFamilySelector,
    { objectMetadataItemId: objectMetadataItem?.id ?? '' },
  );

  // Keyed by record field: lookup and aggregate columns share their relation field
  const columnDescriptorByRecordFieldId = useMemo(
    () =>
      Object.fromEntries(
        currentRecordFields.flatMap((recordField) => {
          const fieldMetadataItem = objectMetadataItem?.fields.find(
            findById(recordField.fieldMetadataItemId),
          );

          if (!isDefined(fieldMetadataItem)) {
            return [];
          }

          return [
            [
              recordField.id,
              getRecordFieldColumnDescriptor({
                fieldMetadataItem,
                lookupTarget: getLookupTarget({
                  recordField,
                  fieldMetadataItem,
                }),
                aggregateTarget: getAggregateTarget({
                  recordField,
                  fieldMetadataItem,
                }),
                isFilterable: filterableFieldMetadataItems.some(
                  findById(fieldMetadataItem.id),
                ),
                isSortable: sortableFieldMetadataItems.some(
                  findById(fieldMetadataItem.id),
                ),
              }),
            ],
          ];
        }),
      ),
    [
      currentRecordFields,
      objectMetadataItem,
      getLookupTarget,
      getAggregateTarget,
      filterableFieldMetadataItems,
      sortableFieldMetadataItems,
    ],
  );

  const labelIdentifierFieldMetadataItem = useAtomFamilySelectorValue(
    labelIdentifierFieldMetadataItemSelector,
    {
      objectMetadataItemId: objectMetadataItem?.id ?? '',
    },
  );

  return {
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
    recordFieldByFieldMetadataItemId,
    columnDescriptorByRecordFieldId,
  };
};
