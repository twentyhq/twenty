import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from 'twenty-shared/constants';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const buildRecordExportColumns = (
  fields: FlatFieldMetadata[],
): RecordExportColumn[] => [
  { fieldName: 'id', label: 'Id', type: FieldMetadataType.UUID },
  ...fields
    .filter((field) => field.name !== 'id')
    .flatMap((field): RecordExportColumn[] => {
      if (
        isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
        isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)
      ) {
        return field.settings.relationType === RelationType.MANY_TO_ONE
          ? [
              {
                fieldName: computeMorphOrRelationFieldJoinColumnName({
                  name: field.name,
                }),
                label: `${field.label} Id`,
                type: FieldMetadataType.UUID,
              },
            ]
          : [];
      }

      const subFields = isCompositeFieldMetadataType(field.type)
        ? COMPOSITE_FIELD_SUB_FIELD_LABELS[field.type]
        : undefined;

      return subFields
        ? Object.entries(subFields).map(([subFieldName, label]) => ({
            fieldName: field.name,
            label: `${field.label} / ${label}`,
            type: field.type,
            subFieldName,
          }))
        : [{ fieldName: field.name, label: field.label, type: field.type }];
    }),
];
