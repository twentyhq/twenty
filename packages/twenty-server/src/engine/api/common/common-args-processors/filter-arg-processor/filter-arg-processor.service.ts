import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
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
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Cap relation-traversal nesting depth. The schema allows arbitrary depth
// because filter inputs reference each other lazily, but the query builder
// can only realistically handle a single hop today — joins are added against
// the root alias only. Bump this when reverse joins / multi-hop are wired up.
const MAX_RELATION_FILTER_DEPTH = 1;

@Injectable()
export class FilterArgProcessorService {
  process<T extends ObjectRecordFilter | undefined>({
    filter,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    filter: T;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
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
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      fieldIdByName,
      fieldIdByJoinColumnName,
      0,
    ) as T;
  }

  private validateAndTransformFilter(
    filterObject: ObjectRecordFilter,
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> | undefined,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    fieldIdByName: Record<string, string>,
    fieldIdByJoinColumnName: Record<string, string>,
    depth: number,
  ): ObjectRecordFilter {
    const transformedFilter: ObjectRecordFilter = {};

    for (const [key, value] of Object.entries(filterObject)) {
      if (key === 'and' || key === 'or') {
        transformedFilter[key] = (value as ObjectRecordFilter[]).map(
          (nestedFilter) =>
            this.validateAndTransformFilter(
              nestedFilter,
              flatObjectMetadata,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              fieldIdByName,
              fieldIdByJoinColumnName,
              depth,
            ),
        );
        continue;
      }

      if (key === 'not') {
        transformedFilter[key] = this.validateAndTransformFilter(
          value as ObjectRecordFilter,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          fieldIdByName,
          fieldIdByJoinColumnName,
          depth,
        );
        continue;
      }

      transformedFilter[key] = this.validateAndTransformFieldFilter(
        key,
        value,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        fieldIdByName,
        fieldIdByJoinColumnName,
        depth,
      );
    }

    return transformedFilter;
  }

  private validateAndTransformFieldFilter(
    key: string,
    filterValue: Record<string, unknown>,
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> | undefined,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    fieldIdByName: Record<string, string>,
    fieldIdByJoinColumnName: Record<string, string>,
    depth: number,
  ): Record<string, unknown> {
    const resolvedByName = fieldIdByName[key];
    const resolvedByJoinColumn = fieldIdByJoinColumnName[key];
    const fieldMetadataId = resolvedByName ?? resolvedByJoinColumn;

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

    if (
      isDefined(resolvedByName) &&
      !isDefined(resolvedByJoinColumn) &&
      (isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION) ||
        isFlatFieldMetadataOfType(
          fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        ))
    ) {
      // Relation accessed by name (e.g. `company` rather than `companyId`).
      // A nested filter object means the caller wants to traverse the relation
      // (e.g. `{ company: { name: { like: "%X%" } } }`). Recurse into the
      // target object's metadata so each leaf still gets validated and
      // value-coerced. Only MANY_TO_ONE is supported for now; ONE_TO_MANY
      // would need EXISTS-subquery support downstream.
      if (
        fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE &&
        isDefined(flatObjectMetadataMaps) &&
        isDefined(fieldMetadata.relationTargetObjectMetadataId)
      ) {
        if (depth >= MAX_RELATION_FILTER_DEPTH) {
          throw new CommonQueryRunnerException(
            `Relation filter nesting deeper than ${MAX_RELATION_FILTER_DEPTH} hop is not supported`,
            CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
            {
              userFriendlyMessage: msg`Relation filters can only traverse one relation deep`,
            },
          );
        }

        const targetObjectMetadata =
          findFlatEntityByIdInFlatEntityMaps<FlatObjectMetadata>({
            flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          });

        if (isDefined(targetObjectMetadata)) {
          const {
            fieldIdByName: targetFieldIdByName,
            fieldIdByJoinColumnName: targetFieldIdByJoinColumnName,
          } = buildFieldMapsFromFlatObjectMetadata(
            flatFieldMetadataMaps,
            targetObjectMetadata,
          );

          return this.validateAndTransformFilter(
            filterValue as unknown as ObjectRecordFilter,
            targetObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            targetFieldIdByName,
            targetFieldIdByJoinColumnName,
            depth + 1,
          ) as unknown as Record<string, unknown>;
        }
      }

      if (fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE) {
        const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: key,
        });

        throw new CommonQueryRunnerException(
          `Cannot filter by relation field "${key}": use "${joinColumnName}" instead`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
          {
            userFriendlyMessage: msg`Invalid filter: use "${joinColumnName}" to filter by this relation field`,
          },
        );
      }

      throw new CommonQueryRunnerException(
        `Cannot filter by relation field "${key}"`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter: filtering by relation field "${key}" is not supported`,
        },
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
