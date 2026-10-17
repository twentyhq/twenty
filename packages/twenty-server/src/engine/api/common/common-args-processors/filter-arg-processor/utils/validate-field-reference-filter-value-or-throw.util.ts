import { msg } from '@lingui/core/macro';
import { FIELD_REFERENCE_FILTER_OPERATORS } from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type FieldReferenceFilterOperator,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
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
  flatFieldMetadataMaps,
}: {
  operator: FieldReferenceFilterOperator;
  value: unknown;
  fieldMetadata: OrmFlatFieldMetadata;
  fieldName: string;
  flatObjectMetadata: FlatObjectMetadata;
  parentFlatObjectMetadata: FlatObjectMetadata | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new CommonQueryRunnerException(
      `Operator "${operator}" on field "${fieldName}" expects the name of a field to compare with`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter: "${operator}" expects a field name`,
      },
    );
  }

  const { isParentFieldReference } = FIELD_REFERENCE_FILTER_OPERATORS[operator];

  const referencedFlatObjectMetadata = isParentFieldReference
    ? parentFlatObjectMetadata
    : flatObjectMetadata;

  if (!isDefined(referencedFlatObjectMetadata)) {
    throw new CommonQueryRunnerException(
      `Operator "${operator}" on field "${fieldName}" can only be used inside a relation filter`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter: "${operator}" can only be used inside a relation filter`,
      },
    );
  }

  const referencedFieldMetadataId = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    referencedFlatObjectMetadata,
  ).fieldIdByName[value];

  const referencedFieldMetadata = isDefined(referencedFieldMetadataId)
    ? findFlatEntityByIdInFlatEntityMaps<OrmFlatFieldMetadata>({
        flatEntityId: referencedFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  if (!isDefined(referencedFieldMetadata)) {
    const nameSingular = referencedFlatObjectMetadata.nameSingular;

    throw new CommonQueryRunnerException(
      `Object ${nameSingular} doesn't have any "${value}" field to compare "${fieldName}" with`,
      CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
      {
        userFriendlyMessage: msg`Invalid filter: ${nameSingular} object doesn't have any "${value}" field.`,
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
        userFriendlyMessage: msg`Invalid filter: "${fieldName}" and "${value}" cannot be compared`,
      },
    );
  }

  return referencedFieldMetadata.name;
};
