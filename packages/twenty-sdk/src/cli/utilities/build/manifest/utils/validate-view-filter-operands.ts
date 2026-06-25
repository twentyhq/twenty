import {
  type FieldManifest,
  type ObjectFieldManifest,
  type ObjectManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import {
  FieldMetadataType,
  type FilterableAndTSVectorFieldType,
} from 'twenty-shared/types';
import {
  FILTER_OPERANDS_MAP,
  getFilterOperandsForFilterableFieldType,
  isDefined,
} from 'twenty-shared/utils';

export const validateViewFilterOperands = ({
  views,
  objects,
  fields,
}: {
  views: ViewManifest[];
  objects: ObjectManifest[];
  fields: FieldManifest[];
}): string[] => {
  const errors: string[] = [];

  const fieldByUniversalIdentifier = new Map<
    string,
    FieldManifest | ObjectFieldManifest
  >();
  for (const field of fields) {
    fieldByUniversalIdentifier.set(field.universalIdentifier, field);
  }
  for (const object of objects) {
    for (const objectField of object.fields) {
      fieldByUniversalIdentifier.set(
        objectField.universalIdentifier,
        objectField,
      );
    }
  }

  for (const view of views) {
    for (const filter of view.filters ?? []) {
      const referencedField = fieldByUniversalIdentifier.get(
        filter.fieldMetadataUniversalIdentifier,
      );
      if (!isDefined(referencedField)) {
        continue;
      }

      const effectiveFieldType: FieldMetadataType =
        referencedField.type === FieldMetadataType.RELATION
          ? (fieldByUniversalIdentifier.get(
              referencedField.relationTargetFieldMetadataUniversalIdentifier,
            )?.type ?? referencedField.type)
          : referencedField.type;

      if (!(effectiveFieldType in FILTER_OPERANDS_MAP)) {
        continue;
      }

      const allowedOperands = getFilterOperandsForFilterableFieldType({
        filterType: effectiveFieldType as FilterableAndTSVectorFieldType,
        subFieldName: filter.subFieldName,
      });

      if (!allowedOperands.includes(filter.operand)) {
        errors.push(
          `Operand "${filter.operand}" is not supported on field "${referencedField.name}" (type "${effectiveFieldType}"). Supported operands: ${allowedOperands.join(', ')}.`,
        );
      }
    }
  }

  return errors;
};
