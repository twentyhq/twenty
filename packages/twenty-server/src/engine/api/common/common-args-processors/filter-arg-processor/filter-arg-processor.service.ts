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

// A relation filter is treated as a traversal (`{ name: { eq: "X" } }`) when
// at least one top-level key matches a field on the target object or is a
// logical operator (`and`/`or`/`not`). Otherwise the value looks like a leaf
// operator shape (`{ eq: "uuid" }`), which is invalid for relation traversal.
const isRelationTraversalShape = ({
  filterValue,
  targetFieldIdByName,
  targetFieldIdByJoinColumnName,
}: {
  filterValue: ObjectRecordFilter;
  targetFieldIdByName: Record<string, string>;
  targetFieldIdByJoinColumnName: Record<string, string>;
}): boolean => {
  if (typeof filterValue !== 'object' || filterValue === null) {
    return false;
  }

  const keys = Object.keys(filterValue);

  if (keys.length === 0) {
    return false;
  }

  return keys.some(
    (k) =>
      k === 'and' ||
      k === 'or' ||
      k === 'not' ||
      isDefined(targetFieldIdByName[k]) ||
      isDefined(targetFieldIdByJoinColumnName[k]),
  );
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

      // If the key resolves to a relation field accessed by name (not by FK
      // column), branch into relation traversal so we recurse into the target
      // object's metadata. This keeps `validateAndTransformFieldFilter` focused
      // on scalar + composite fields and avoids casting between
      // `ObjectRecordFilter` and the field-filter shape.
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

  // Returns the field metadata if the key targets a relation by its name (not
  // by its FK join column). Returns undefined otherwise — callers fall back to
  // the scalar/composite path.
  private resolveRelationFieldMetadataByName({
    key,
    fieldIdByName,
    fieldIdByJoinColumnName,
    flatFieldMetadataMaps,
  }: {
    key: string;
    fieldIdByName: Record<string, string>;
    fieldIdByJoinColumnName: Record<string, string>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }):
    | FlatFieldMetadata<
        FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
      >
    | undefined {
    const resolvedByName = fieldIdByName[key];

    if (!isDefined(resolvedByName) || isDefined(fieldIdByJoinColumnName[key])) {
      return undefined;
    }

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps<FlatFieldMetadata>(
      {
        flatEntityId: resolvedByName,
        flatEntityMaps: flatFieldMetadataMaps,
      },
    );

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
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    depth: number,
  ): ObjectRecordFilter {
    if (fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE) {
      throw new CommonQueryRunnerException(
        `Cannot filter by relation field "${key}"`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FILTER,
        {
          userFriendlyMessage: msg`Invalid filter: filtering by relation field "${key}" is not supported`,
        },
      );
    }

    const targetObjectMetadataId = fieldMetadata.relationTargetObjectMetadataId;

    if (
      !isDefined(flatObjectMetadataMaps) ||
      !isDefined(targetObjectMetadataId)
    ) {
      // Can't resolve the target — fall back to the legacy guidance that
      // points users at the FK column.
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

    const {
      fieldIdByName: targetFieldIdByName,
      fieldIdByJoinColumnName: targetFieldIdByJoinColumnName,
    } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      targetObjectMetadata,
    );

    // Distinguish between a relation-traversal filter
    // (`{ name: { eq: "X" } }`) and the legacy leaf-operator shape
    // (`{ eq: "uuid" }`). The latter is invalid against the target object's
    // schema, so we surface the friendlier "use companyId instead" message
    // before recursing.
    if (
      !isRelationTraversalShape({
        filterValue,
        targetFieldIdByName,
        targetFieldIdByJoinColumnName,
      })
    ) {
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

    return this.validateAndTransformFilter(
      filterValue,
      targetObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      targetFieldIdByName,
      targetFieldIdByJoinColumnName,
      depth + 1,
    );
  }

  private validateAndTransformFieldFilter(
    key: string,
    filterValue: Record<string, unknown>,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    fieldIdByName: Record<string, string>,
    fieldIdByJoinColumnName: Record<string, string>,
  ): Record<string, unknown> {
    const fieldMetadataId = fieldIdByName[key] ?? fieldIdByJoinColumnName[key];

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

    // ONE_TO_MANY (and other non-MANY_TO_ONE relation types) accessed by name
    // get rejected with the legacy message — they don't have an FK column to
    // suggest, and traversal isn't supported yet.
    if (
      isDefined(fieldIdByName[key]) &&
      !isDefined(fieldIdByJoinColumnName[key]) &&
      (isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION) ||
        isFlatFieldMetadataOfType(
          fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        ))
    ) {
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
