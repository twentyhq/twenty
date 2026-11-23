import { labelIdentifierFieldMetadataItemSelector } from '@/object-metadata/states/labelIdentifierFieldMetadataItemSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordIndexFieldMetadataDerivedStates = (
  objectMetadataItem: EnrichedObjectMetadataItem | undefined,
  recordIndexId?: string | undefined,
) => {
  const fieldMetadataItems = objectMetadataItem?.fields ?? [];

  // Kept stable so the scoped relation aliases built from it are not recomputed on every render
  const fieldMetadataItemByFieldMetadataItemId = useMemo(
    () =>
      Object.fromEntries(
        (objectMetadataItem?.fields ?? []).map((fieldMetadataItem) => [
          fieldMetadataItem.id,
          fieldMetadataItem,
        ]),
      ),
    [objectMetadataItem?.fields],
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
  };
};
