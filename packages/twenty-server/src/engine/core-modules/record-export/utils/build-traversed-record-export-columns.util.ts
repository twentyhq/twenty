import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from 'twenty-shared/constants';

import { type RecordExportColumn } from 'src/engine/core-modules/record-export/types/record-export-column.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const buildTraversedRecordExportColumns = ({
  relationField,
  targetField,
}: {
  relationField: FlatFieldMetadata;
  targetField: FlatFieldMetadata;
}): RecordExportColumn[] => {
  const label = `${relationField.label} › ${targetField.label}`;
  const subFields = isCompositeFieldMetadataType(targetField.type)
    ? COMPOSITE_FIELD_SUB_FIELD_LABELS[targetField.type]
    : undefined;

  return subFields
    ? Object.entries(subFields).map(([subFieldName, subFieldLabel]) => ({
        relationFieldName: relationField.name,
        fieldName: targetField.name,
        label: `${label} / ${subFieldLabel}`,
        type: targetField.type,
        subFieldName,
      }))
    : [
        {
          relationFieldName: relationField.name,
          fieldName: targetField.name,
          label,
          type: targetField.type,
        },
      ];
};
