import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatTraversedFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatTraversedFieldMetadataItemAsColumnDefinition';
import { resolveRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { labelIdentifierFieldMetadataItemSelector } from '@/object-metadata/states/labelIdentifierFieldMetadataItemSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

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

  const { objectMetadataItems } = useObjectMetadataItems();

  const recordFieldByRecordFieldKey = Object.fromEntries(
    currentRecordFields.map((recordField) => [
      getRecordFieldKey(recordField),
      recordField,
    ]),
  );

  // A record field reached through a relation shares its fieldMetadataItemId
  // with the plain relation column, which is the one a field metadata item maps to.
  const recordFieldByFieldMetadataItemId = Object.fromEntries(
    currentRecordFields
      .filter(
        (recordField) =>
          !isDefined(recordField.relationTargetFieldMetadataItemId),
      )
      .map((recordField) => [recordField.fieldMetadataItemId, recordField]),
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

  const fieldDefinitionByRecordFieldKey = Object.fromEntries(
    currentRecordFields.flatMap(
      (recordField): [string, ColumnDefinition<FieldMetadata>][] => {
        if (isDefined(recordField.relationTargetFieldMetadataItemId)) {
          if (!isDefined(objectMetadataItem)) {
            return [];
          }

          const relationTraversal = resolveRecordFieldRelationTraversal({
            recordField,
            sourceObjectMetadataItem: objectMetadataItem,
            objectMetadataItems,
          });

          if (!isDefined(relationTraversal)) {
            return [];
          }

          return [
            [
              getRecordFieldKey(recordField),
              formatTraversedFieldMetadataItemAsColumnDefinition({
                ...relationTraversal,
                position: recordField.position,
                labelWidth: recordField.size,
              }),
            ],
          ];
        }

        const fieldDefinition =
          fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

        if (!isDefined(fieldDefinition)) {
          return [];
        }

        return [[getRecordFieldKey(recordField), fieldDefinition]];
      },
    ),
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
    fieldDefinitionByRecordFieldKey,
    recordFieldByFieldMetadataItemId,
    recordFieldByRecordFieldKey,
  };
};
