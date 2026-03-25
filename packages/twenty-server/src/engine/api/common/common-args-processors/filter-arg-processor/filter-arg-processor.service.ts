import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { validateAndTransformOperatorAndValue } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/validate-and-transform-operator-and-value.util';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class FilterArgProcessorService {
  process<T extends ObjectRecordFilter | undefined>({
    filter,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }: {
    filter: T;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): T {
    if (!isDefined(filter)) {
      return filter;
    }

    const { fieldIdByName, fieldIdByJoinColumnName } =
      buildFieldMapsFromFlatObjectMetadata(
        flatFieldMetadataMaps,
        flatObjectMetadata,
      );

    return this.validateAndTransformFilter(
      filter,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      fieldIdByName,
      fieldIdByJoinColumnName,
    ) as T;
  }

  private validateAndTransformFilter(
    filterObject: ObjectRecordFilter,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    fieldIdByName: Record<string, string>,
    fieldIdByJoinColumnName: Record<string, string>,
  ): ObjectRecordFilter {
    const transformedFilter: ObjectRecordFilter = {};

    for (const [key, value] of Object.entries(filterObject)) {
      if (key === 'and' || key === 'or') {
        transformedFilter[key] = (value as ObjectRecordFilter[]).map(
          (nestedFilter) =>
            this.validateAndTransformFilter(
              nestedFilter,
              flatObjectMetadata,
              flatFieldMetadataMaps,
              fieldIdByName,
              fieldIdByJoinColumnName,
            ),
        );
        continue;
      }

      if (key === 'not') {
        transformedFilter[key] = this.validateAndTransformFilter(
          value as ObjectRecordFilter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
          fieldIdByName,
          fieldIdByJoinColumnName,
        );
        continue;
      }

      transformedFilter[key] = this.validateAndTransformFieldFilter(
        key,
        value,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        fieldIdByName,
        fieldIdByJoinColumnName,
      );
    }

    return transformedFilter;
  }

  private validateAndTransformFieldFilter(
    key: string,
    filterValue: Record<string, unknown>,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    fieldIdByName: Record<string, string>,
    fieldIdByJoinColumnName: Record<string, string>,
  ): Record<string, unknown> {
    const fieldMetadataId = fieldIdByName[key] || fieldIdByJoinColumnName[key];

    if (!isDefined(fieldMetadataId)) {
      const nameSingular = flatObjectMetadata.nameSingular;

      throw new CommonQueryRunnerException(
        `Object ${flatObjectMetadata.nameSingular} doesn't have any "${key}" field.`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter : ${nameSingular} object doesn't have any "${key}" field.`,
        },
      );
    }

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps<FlatFieldMetadata>(
      {
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      },
    );

    if (!fieldMetadata) {
      throw new CommonQueryRunnerException(
        `Field metadata not found for field ${key}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      return this.validateAndTransformCompositeFieldFilter(
        fieldMetadata,
        filterValue,
      );
    }

    return validateAndTransformOperatorAndValue(
      key,
      filterValue,
      fieldMetadata,
    );
  }

  private validateAndTransformCompositeFieldFilter(
    fieldMetadata: FlatFieldMetadata,
    filterValue: Record<string, unknown>,
  ): Record<string, unknown> {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new CommonQueryRunnerException(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const transformedFilter: Record<string, unknown> = {};

    for (const [subFieldKey, subFieldFilter] of Object.entries(filterValue)) {
      const subFieldMetadata = compositeType.properties.find(
        (property) => property.name === subFieldKey,
      );

      if (!subFieldMetadata) {
        throw new CommonQueryRunnerException(
          `Sub field "${subFieldKey}" not found for composite type: ${fieldMetadata.type}`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      transformedFilter[subFieldKey] = validateAndTransformOperatorAndValue(
        `${fieldMetadata.name}.${subFieldKey}`,
        subFieldFilter as Record<string, unknown>,
        {
          ...fieldMetadata,
          type: subFieldMetadata.type as FieldMetadataType,
        },
      );
    }

    return transformedFilter;
  }
}
