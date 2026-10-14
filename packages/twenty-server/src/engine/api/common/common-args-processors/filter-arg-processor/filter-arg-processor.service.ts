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

import { MAX_RELATION_FILTER_DEPTH } from 'src/engine/api/common/common-args-processors/filter-arg-processor/constants/max-relation-filter-depth.constant';
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
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

function throwUseJoinColumnInstead(key: string): never {
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

const computeParentRelationHints = ({
  parentRelationFieldMetadata,
}: {
  parentRelationFieldMetadata?: FlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >;
}): { relationContext: string; joinColumnHint: string } => {
  if (!isDefined(parentRelationFieldMetadata)) {
    return { relationContext: '', joinColumnHint: '' };
  }

  const relationContext = ` (filtering through relation "${parentRelationFieldMetadata.name}")`;

  if (
    parentRelationFieldMetadata.settings?.relationType !==
    RelationType.MANY_TO_ONE
  ) {
    return { relationContext, joinColumnHint: '' };
  }

  const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
    name: parentRelationFieldMetadata.name,
  });

  return {
    relationContext,
    joinColumnHint: ` To filter by the related record id instead, use "${joinColumnName}".`,
  };
};

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
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): T {
    if (!isDefined(filter)) {
      return filter;
    }

    const { fieldIdByName, fieldIdByJoinColumnName } =
      buildFieldMapsFromFlatObjectMetadata(
        flatFieldMetadataMaps,
        flatObjectMetadata,
      );

    return this.validateAndTransformFilter({
      filterObject: filter,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      fieldIdByName,
      fieldIdByJoinColumnName,
      depth: 0,
    }) as T;
  }

  private validateAndTransformFilter({
    filterObject,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    fieldIdByName,
    fieldIdByJoinColumnName,
    depth,
    parentRelationFieldMetadata,
  }: {
    filterObject: ObjectRecordFilter;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> | undefined;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    fieldIdByName: Record<string, string>;
    fieldIdByJoinColumnName: Record<string, string>;
    depth: number;
    parentRelationFieldMetadata?: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
  }): ObjectRecordFilter {
    const transformedFilter: ObjectRecordFilter = {};

    for (const [key, value] of Object.entries(filterObject)) {
      if (key === 'and' || key === 'or') {
        transformedFilter[key] = (value as ObjectRecordFilter[]).map(
          (nestedFilter) =>
            this.validateAndTransformFilter({
              filterObject: nestedFilter,
              flatObjectMetadata,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
              fieldIdByName,
              fieldIdByJoinColumnName,
              depth,
              parentRelationFieldMetadata,
            }),
        );
        continue;
      }

      if (key === 'not') {
        transformedFilter[key] = this.validateAndTransformFilter({
          filterObject: value as ObjectRecordFilter,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          fieldIdByName,
          fieldIdByJoinColumnName,
          depth,
          parentRelationFieldMetadata,
        });
        continue;
      }

      const fieldMetadataForRelation = this.resolveRelationFieldMetadataByName({
        key,
        fieldIdByName,
        fieldIdByJoinColumnName,
        flatFieldMetadataMaps,
      });

      if (isDefined(fieldMetadataForRelation)) {
        transformedFilter[key] = this.validateAndTransformRelationFilter(
          key,
          value,
          fieldMetadataForRelation,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          depth,
        );
        continue;
      }

      transformedFilter[key] = this.validateAndTransformFieldFilter({
        key,
        filterValue: value,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        fieldIdByName,
        fieldIdByJoinColumnName,
        parentRelationFieldMetadata,
      });
    }

    return transformedFilter;
  }

  private resolveRelationFieldMetadataByName({
    key,
    fieldIdByName,
    fieldIdByJoinColumnName,
    flatFieldMetadataMaps,
  }: {
    key: string;
    fieldIdByName: Record<string, string>;
    fieldIdByJoinColumnName: Record<string, string>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }):
    | FlatFieldMetadata<
        FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
      >
    | undefined {
    const resolvedByName = fieldIdByName[key];

    if (!isDefined(resolvedByName) || isDefined(fieldIdByJoinColumnName[key])) {
      return undefined;
    }

    const fieldMetadata =
      findFlatEntityByIdInFlatEntityMaps<OrmFlatFieldMetadata>({
        flatEntityId: resolvedByName,
        flatEntityMaps: flatFieldMetadataMaps,
      });

    if (!isDefined(fieldMetadata)) {
      return undefined;
    }

    if (
      isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION) ||
      isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.MORPH_RELATION)
    ) {
      return fieldMetadata;
    }

    return undefined;
  }

  private validateAndTransformRelationFilter(
    key: string,
    filterValue: ObjectRecordFilter,
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> | undefined,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
    depth: number,
  ): ObjectRecordFilter {
    const isFilterableRelation =
      fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE ||
      (isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION) &&
        fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY);

    if (!isFilterableRelation) {
      throw new CommonQueryRunnerException(
        `Cannot filter by relation field "${key}"`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter: filtering by relation field "${key}" is not supported`,
        },
      );
    }

    if (typeof filterValue !== 'object' || filterValue === null) {
      throwUseJoinColumnInstead(key);
    }

    const targetObjectMetadataId = fieldMetadata.relationTargetObjectMetadataId;

    if (
      !isDefined(flatObjectMetadataMaps) ||
      !isDefined(targetObjectMetadataId)
    ) {
      throwUseJoinColumnInstead(key);
    }

    const targetObjectMetadata =
      findFlatEntityByIdInFlatEntityMaps<FlatObjectMetadata>({
        flatEntityId: targetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

    if (!isDefined(targetObjectMetadata)) {
      throwUseJoinColumnInstead(key);
    }

    if (depth >= MAX_RELATION_FILTER_DEPTH) {
      throw new CommonQueryRunnerException(
        `Relation filter nesting deeper than ${MAX_RELATION_FILTER_DEPTH} hop is not supported`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Relation filters can only traverse one relation deep`,
        },
      );
    }

    const {
      fieldIdByName: targetFieldIdByName,
      fieldIdByJoinColumnName: targetFieldIdByJoinColumnName,
    } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      targetObjectMetadata,
    );

    return this.validateAndTransformFilter({
      filterObject: filterValue,
      flatObjectMetadata: targetObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      fieldIdByName: targetFieldIdByName,
      fieldIdByJoinColumnName: targetFieldIdByJoinColumnName,
      depth: depth + 1,
      parentRelationFieldMetadata: fieldMetadata,
    });
  }

  private validateAndTransformFieldFilter({
    key,
    filterValue,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    fieldIdByName,
    fieldIdByJoinColumnName,
    parentRelationFieldMetadata,
  }: {
    key: string;
    filterValue: Record<string, unknown>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    fieldIdByName: Record<string, string>;
    fieldIdByJoinColumnName: Record<string, string>;
    parentRelationFieldMetadata?: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
  }): Record<string, unknown> {
    const fieldMetadataId = fieldIdByName[key] ?? fieldIdByJoinColumnName[key];

    if (!isDefined(fieldMetadataId)) {
      const nameSingular = flatObjectMetadata.nameSingular;
      const { relationContext, joinColumnHint } = computeParentRelationHints({
        parentRelationFieldMetadata,
      });

      throw new CommonQueryRunnerException(
        `Object ${nameSingular} doesn't have any "${key}" field${relationContext}. Filter keys must be field names or and/or/not, with operators nested under a field: { <fieldName>: { <operator>: <value> } }.${joinColumnHint}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter : ${nameSingular} object doesn't have any "${key}" field.`,
        },
      );
    }

    const fieldMetadata =
      findFlatEntityByIdInFlatEntityMaps<OrmFlatFieldMetadata>({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

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
    fieldMetadata: OrmFlatFieldMetadata,
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
        const subFieldNames = compositeType.properties.map(
          (property) => property.name,
        );

        throw new CommonQueryRunnerException(
          `Sub field "${subFieldKey}" not found for composite type: ${fieldMetadata.type}. Available sub fields: ${subFieldNames.join(', ')}.`,
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
