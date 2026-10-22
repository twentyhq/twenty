import {
  type buildRecordExportColumns,
  computeMorphRelationGqlFieldName,
  isDefined,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordExportSubFieldLabels } from '@/object-record/record-index/export/utils/getRecordExportSubFieldLabels';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

type RecordExportField = Parameters<typeof buildRecordExportColumns>[0][number];

// Matches the server export: one column per morph target, keyed by its own join column
export const getRecordExportFields = ({
  columns,
  objectMetadataItems,
}: {
  columns: Pick<
    ColumnDefinition<FieldMetadata>,
    'label' | 'type' | 'metadata'
  >[];
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'labelSingular'
  >[];
}): RecordExportField[] =>
  columns.flatMap((column): RecordExportField[] => {
    const relationType =
      'relationType' in column.metadata
        ? column.metadata.relationType
        : undefined;

    if (!('morphRelations' in column.metadata)) {
      return [
        {
          name: column.metadata.fieldName,
          label: column.label,
          type: column.type,
          subFieldLabels: getRecordExportSubFieldLabels(column.type),
          relationType,
        },
      ];
    }

    const { fieldName } = column.metadata;

    return column.metadata.morphRelations.map((morphRelation) => {
      const targetObjectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === morphRelation.targetObjectMetadata.id,
      );

      return {
        name: computeMorphRelationGqlFieldName({
          fieldName,
          relationType: morphRelation.type,
          targetObjectMetadataNameSingular:
            morphRelation.targetObjectMetadata.nameSingular,
          targetObjectMetadataNamePlural:
            morphRelation.targetObjectMetadata.namePlural,
        }),
        label: isDefined(targetObjectMetadataItem)
          ? `${column.label} / ${targetObjectMetadataItem.labelSingular}`
          : column.label,
        type: column.type,
        relationType: morphRelation.type,
      };
    });
  });
