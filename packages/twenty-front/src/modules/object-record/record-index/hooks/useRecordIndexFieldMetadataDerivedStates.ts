import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { labelIdentifierFieldMetadataItemSelector } from '@/object-metadata/states/labelIdentifierFieldMetadataItemSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { getRecordFieldColumnDescriptor } from '@/object-record/record-field/utils/getRecordFieldColumnDescriptor';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMemo } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';
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

  const isLookupColumnsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_LOOKUP_COLUMNS_ENABLED,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const filterableFieldMetadataItems = useAtomFamilySelectorValue(
    availableFieldMetadataItemsForFilterFamilySelector,
    { objectMetadataItemId: objectMetadataItem?.id ?? '' },
  );
  const sortableFieldMetadataItems = useAtomFamilySelectorValue(
    availableFieldMetadataItemsForSortFamilySelector,
    { objectMetadataItemId: objectMetadataItem?.id ?? '' },
  );

  // Keyed by record field: lookup columns share their relation field
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
                // With the flag off a lookup column renders, loads and aggregates as its plain relation
                lookupTarget: isLookupColumnsEnabled
                  ? getRecordFieldLookupTarget({
                      recordField,
                      fieldMetadataItem,
                      objectMetadataItems,
                    })
                  : undefined,
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
      isLookupColumnsEnabled,
      objectMetadataItems,
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
