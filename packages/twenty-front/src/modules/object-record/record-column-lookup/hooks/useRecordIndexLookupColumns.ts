import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordIndexLookupColumns = () => {
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();

  const lookupColumns = useMemo(
    () =>
      visibleRecordFields.flatMap((recordField) => {
        const fieldMetadataItem =
          fieldMetadataItemByFieldMetadataItemId[
            recordField.fieldMetadataItemId
          ];

        return isDefined(fieldMetadataItem) &&
          isDefined(
            getRecordFieldLookupTarget({
              recordField,
              fieldMetadataItem,
              objectMetadataItems,
            }),
          )
          ? [
              {
                relationFieldName: fieldMetadataItem.name,
                lookupTargetFieldMetadataId:
                  recordField.relationTargetFieldMetadataId,
              },
            ]
          : [];
      }),
    [
      visibleRecordFields,
      fieldMetadataItemByFieldMetadataItemId,
      objectMetadataItems,
    ],
  );

  const lookupRelationFieldNames = useMemo(
    () => lookupColumns.map(({ relationFieldName }) => relationFieldName),
    [lookupColumns],
  );

  return { lookupColumns, lookupRelationFieldNames };
};
