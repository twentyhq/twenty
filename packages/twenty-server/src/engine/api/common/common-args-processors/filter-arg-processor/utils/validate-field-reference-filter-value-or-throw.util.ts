import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  type FieldReferenceFilterOperator,
} from 'twenty-shared/types';
import { isDefined, parseFieldReferenceFilterValue } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { findFlatFieldMetadataByName } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadata-by-name.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Number types share one family since Postgres compares them across types
const COMPARISON_FAMILY_BY_FIELD_TYPE: Partial<
  Record<FieldMetadataType, string>
> = {
  [FieldMetadataType.DATE]: 'DATE',
  [FieldMetadataType.DATE_TIME]: 'DATE_TIME',
  [FieldMetadataType.NUMBER]: 'NUMBER',
  [FieldMetadataType.NUMERIC]: 'NUMBER',
  [FieldMetadataType.POSITION]: 'NUMBER',
};

export const validateFieldReferenceFilterValueOrThrow = ({
  operator,
  value,
  fieldMetadata,
  fieldName,
  flatObjectMetadata,
  parentFlatObjectMetadata,
  parentRelationFieldMetadata,
  flatFieldMetadataMaps,
}: {
  operator: FieldReferenceFilterOperator;
  value: unknown;
  fieldMetadata: OrmFlatFieldMetadata;
  fieldName: string;
  flatObjectMetadata: FlatObjectMetadata;
  parentFlatObjectMetadata: FlatObjectMetadata | undefined;
  parentRelationFieldMetadata:
    | FlatFieldMetadata<
        FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
      >
    | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string => {
  const fieldReference = parseFieldReferenceFilterValue(value);

  if (!isDefined(fieldReference)) {
    throw new CommonQueryRunnerException(
      `Operator "${operator}" on field "${fieldName}" expects "field" or "relation.field"`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter: "${operator}" expects a field name`,
      },
    );
  }

  const { relationFieldName, fieldName: referencedFieldName } = fieldReference;
  let referencedFlatObjectMetadata = flatObjectMetadata;

  if (isDefined(relationFieldName)) {
    const relationFieldMetadata = findFlatFieldMetadataByName({
      fieldName: relationFieldName,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    if (
      !isDefined(parentFlatObjectMetadata) ||
      !isDefined(parentRelationFieldMetadata) ||
      relationFieldMetadata?.relationTargetFieldMetadataId !==
        parentRelationFieldMetadata.id
    ) {
      throw new CommonQueryRunnerException(
        `Field reference "${value}" on "${fieldName}" must go through the relation back to the record the relation filter starts from`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter: "${relationFieldName}" can only reference the record the relation filter starts from`,
        },
      );
    }

    referencedFlatObjectMetadata = parentFlatObjectMetadata;
  }

  const referencedFieldMetadata = findFlatFieldMetadataByName({
    fieldName: referencedFieldName,
    flatObjectMetadata: referencedFlatObjectMetadata,
    flatFieldMetadataMaps,
  });

  if (!isDefined(referencedFieldMetadata)) {
    const nameSingular = referencedFlatObjectMetadata.nameSingular;

    throw new CommonQueryRunnerException(
      `Object ${nameSingular} doesn't have any "${referencedFieldName}" field to compare "${fieldName}" with`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter: ${nameSingular} object doesn't have any "${referencedFieldName}" field.`,
      },
    );
  }

  const comparisonFamily = COMPARISON_FAMILY_BY_FIELD_TYPE[fieldMetadata.type];

  if (
    !isDefined(comparisonFamily) ||
    COMPARISON_FAMILY_BY_FIELD_TYPE[referencedFieldMetadata.type] !==
      comparisonFamily
  ) {
    const fieldType = fieldMetadata.type;
    const referencedFieldType = referencedFieldMetadata.type;

    throw new CommonQueryRunnerException(
      `Cannot compare field "${fieldName}" of type ${fieldType} with field "${value}" of type ${referencedFieldType}`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter: "${fieldName}" and "${referencedFieldName}" cannot be compared`,
      },
    );
  }

  return isDefined(relationFieldName)
    ? `${relationFieldName}.${referencedFieldName}`
    : referencedFieldName;
};
