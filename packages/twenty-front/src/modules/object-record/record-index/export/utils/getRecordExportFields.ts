import {
  type buildRecordExportColumns,
  computeMorphRelationGqlFieldName,
  CustomError,
  expandRecordExportMorphFields,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getRecordExportSubFieldLabels } from '@/object-record/record-index/export/utils/getRecordExportSubFieldLabels';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { t } from '@lingui/core/macro';

type RecordExportField = Parameters<typeof buildRecordExportColumns>[0][number];

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

    if (
      !('morphRelations' in column.metadata) ||
      !isNonEmptyArray(column.metadata.morphRelations)
    ) {
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

    return expandRecordExportMorphFields({
      label: column.label,
      morphTargets: column.metadata.morphRelations.map((morphRelation) => {
        const targetObjectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.id === morphRelation.targetObjectMetadata.id,
        );

        if (!isDefined(targetObjectMetadataItem)) {
          throw new CustomError(
            t`An export field is no longer available.`,
            'MORPH_TARGET_NOT_FOUND',
          );
        }

        return {
          fieldName: computeMorphRelationGqlFieldName({
            fieldName,
            relationType: morphRelation.type,
            targetObjectMetadataNameSingular:
              morphRelation.targetObjectMetadata.nameSingular,
            targetObjectMetadataNamePlural:
              morphRelation.targetObjectMetadata.namePlural,
          }),
          labelSingular: targetObjectMetadataItem.labelSingular,
          relationType: morphRelation.type,
        };
      }),
    });
  });
