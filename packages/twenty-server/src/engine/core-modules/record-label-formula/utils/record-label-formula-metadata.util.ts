import {
  type FieldMetadataSettingsMapping,
  FieldMetadataType,
  type LabelIdentifierFormula,
  type ObjectRecord,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { evaluateLabelIdentifierFormula } from 'src/engine/core-modules/record-label-formula/utils/evaluate-label-identifier-formula.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type RecordLabelFormulaDefinition = {
  formula: LabelIdentifierFormula;
  labelIdentifierFieldMetadata: FlatFieldMetadata<FieldMetadataType.TEXT>;
};

export const getRecordLabelFormulaDefinition = ({
  flatFieldMetadataMaps,
  flatObjectMetadata,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadata: FlatObjectMetadata;
}): RecordLabelFormulaDefinition | undefined => {
  const labelIdentifierFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: flatObjectMetadata.labelIdentifierFieldMetadataId ?? '',
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (
    !isDefined(labelIdentifierFieldMetadata) ||
    !isFlatFieldMetadataOfType(
      labelIdentifierFieldMetadata,
      FieldMetadataType.TEXT,
    )
  ) {
    return undefined;
  }

  const settings = labelIdentifierFieldMetadata.settings as
    | FieldMetadataSettingsMapping[FieldMetadataType.TEXT]
    | null;
  const formula = settings?.labelIdentifierFormula;

  return isDefined(formula)
    ? { formula, labelIdentifierFieldMetadata }
    : undefined;
};

export const getRecordLabelFormulaReferencedFieldMetadatas = ({
  flatFieldMetadataMaps,
  formula,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  formula: LabelIdentifierFormula;
}): FlatFieldMetadata[] =>
  [
    ...new Set(
      formula.fieldReferences.flatMap(
        ({ fieldMetadataUniversalIdentifiers }) =>
          fieldMetadataUniversalIdentifiers,
      ),
    ),
  ]
    .map((fieldMetadataUniversalIdentifier) =>
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: fieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined);

export const evaluateRecordLabelFormula = ({
  flatFieldMetadataMaps,
  formula,
  record,
  relationRecordLabels,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  formula: LabelIdentifierFormula;
  record: ObjectRecord;
  relationRecordLabels: Map<string, string>;
}): string =>
  evaluateLabelIdentifierFormula({
    formula,
    resolveFieldValue: (fieldMetadataUniversalIdentifier) => {
      const fieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier: fieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      return isDefined(fieldMetadata)
        ? formatRecordLabelFormulaFieldValue({
            fieldMetadata,
            record,
            relationRecordLabels,
          })
        : '';
    },
  });

const formatRecordLabelFormulaFieldValue = ({
  fieldMetadata,
  record,
  relationRecordLabels,
}: {
  fieldMetadata: FlatFieldMetadata;
  record: ObjectRecord;
  relationRecordLabels: Map<string, string>;
}): string => {
  if (fieldMetadata.type === FieldMetadataType.RELATION) {
    const relationRecordId =
      record[
        computeMorphOrRelationFieldJoinColumnName({ name: fieldMetadata.name })
      ];

    if (
      typeof relationRecordId !== 'string' ||
      !isDefined(fieldMetadata.relationTargetObjectMetadataId)
    ) {
      return '';
    }

    return (
      relationRecordLabels.get(
        `${fieldMetadata.relationTargetObjectMetadataId}:${relationRecordId}`,
      ) ?? ''
    );
  }

  const value = record[fieldMetadata.name];

  if (!isDefined(value) || value === '') {
    return '';
  }

  if (
    fieldMetadata.type === FieldMetadataType.SELECT ||
    fieldMetadata.type === FieldMetadataType.RATING
  ) {
    return (
      fieldMetadata.options?.find((option) => option.value === value)?.label ??
      String(value)
    );
  }

  if (fieldMetadata.type === FieldMetadataType.FULL_NAME) {
    const fullNameValue = value as {
      firstName?: string;
      lastName?: string;
    };

    return `${fullNameValue.firstName ?? ''} ${fullNameValue.lastName ?? ''}`.trim();
  }

  return String(value).trim();
};
