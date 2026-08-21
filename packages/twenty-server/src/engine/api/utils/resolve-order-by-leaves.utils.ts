import {
  type CompositeProperty,
  FieldMetadataType,
  type ObjectsPermissions,
  type OrderByDirection,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { assertFieldIsReadableOrThrow } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/assert-field-is-readable-or-throw.util';
import { isOrderByDirection } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/is-order-by-direction.util';
import { resolveFilterKeyFieldMetadata } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/resolve-filter-key-field-metadata.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type OrderByLeaf = {
  // Path of the ordered value from the record root, e.g. ['closeDate'],
  // ['name', 'firstName'], ['company', 'name'] or ['company', 'name',
  // 'firstName']. It is at once the cursor value path and the filter nesting
  // of the keyset conditions.
  path: string[];
  direction: OrderByDirection;
  fieldMetadata: FlatFieldMetadata;
} & (
  | // Scalar columns, including join columns addressed directly (e.g. companyId)
    { kind: 'scalar' }
  | { kind: 'composite'; compositeProperty: CompositeProperty }
  | {
      kind: 'relation';
      // Resolved against the target object when flatObjectMetadataMaps is
      // provided; the keyset condition builder relies on it for NULL semantics
      targetFieldMetadata?: FlatFieldMetadata;
      targetCompositeProperty?: CompositeProperty;
    }
);

// RAW_JSON sub-fields can be ordered by in SQL but take no part in cursors
export const checkIfLeafCanCarryCursorValue = (leaf: OrderByLeaf): boolean => {
  switch (leaf.kind) {
    case 'relation':
      return leaf.targetCompositeProperty?.type !== FieldMetadataType.RAW_JSON;
    case 'composite':
      return leaf.compositeProperty.type !== FieldMetadataType.RAW_JSON;
    case 'scalar':
      return true;
  }
};

const throwInvalidOrderByInput = (message: string): never => {
  throw new GraphqlQueryRunnerException(
    message,
    GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};

// Flattens the nested value of a relation orderBy entry into its leaf paths,
// e.g. { name: 'AscNullsLast' } -> [['name']] and, for a composite target
// field, { name: { firstName: 'AscNullsLast' } } -> [['name', 'firstName']].
const flattenNestedOrderByValue = (
  value: Record<string, unknown>,
): Array<{ path: string[]; direction: OrderByDirection }> =>
  Object.entries(value).flatMap(([key, nestedValue]) => {
    if (isPlainObject(nestedValue)) {
      return flattenNestedOrderByValue(nestedValue).map(
        ({ path, direction }) => ({ path: [key, ...path], direction }),
      );
    }

    return isOrderByDirection(nestedValue)
      ? [{ path: [key], direction: nestedValue }]
      : [];
  });

// Resolves one flattened relation orderBy path (e.g. ['company', 'name'] or
// ['pointOfContact', 'name', 'firstName']) against the relation's target
// object. Without the object metadata maps the leaf stays unresolved, which is
// enough for consumers that ignore relation leaves (e.g. column selection).
const resolveRelationLeaf = ({
  fieldMetadata,
  path,
  direction,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  strictValidation,
  objectsPermissions,
}: {
  fieldMetadata: FlatFieldMetadata;
  path: string[];
  direction: OrderByDirection;
  flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  strictValidation: boolean;
  objectsPermissions?: ObjectsPermissions;
}): OrderByLeaf | null => {
  const targetObjectMetadata =
    isDefined(flatObjectMetadataMaps) &&
    isDefined(fieldMetadata.relationTargetObjectMetadataId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;

  if (!isDefined(targetObjectMetadata)) {
    return { kind: 'relation', path, direction, fieldMetadata };
  }

  const [, targetFieldName, targetPropertyName, ...extraPath] = path;
  const targetFieldMetadataId = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    targetObjectMetadata,
  ).fieldIdByName[targetFieldName];
  const targetFieldMetadata = isDefined(targetFieldMetadataId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: targetFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  if (!isDefined(targetFieldMetadata)) {
    if (strictValidation) {
      throw new GraphqlQueryRunnerException(
        `Nested field "${targetFieldName}" not found in target object "${targetObjectMetadata.nameSingular}"`,
        GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    return null;
  }

  assertFieldIsReadableOrThrow({
    objectsPermissions,
    objectMetadataId: targetObjectMetadata.id,
    fieldMetadataId: targetFieldMetadata.id,
  });

  if (isCompositeFieldMetadataType(targetFieldMetadata.type)) {
    const targetCompositeProperty = compositeTypeDefinitions
      .get(targetFieldMetadata.type)
      ?.properties.find((property) => property.name === targetPropertyName);

    if (!isDefined(targetCompositeProperty) || extraPath.length > 0) {
      if (strictValidation) {
        throwInvalidOrderByInput(
          `Composite field "${path[0]}.${targetFieldName}" requires one of its sub fields to be ordered`,
        );
      }

      return null;
    }

    return {
      kind: 'relation',
      path,
      direction,
      fieldMetadata,
      targetFieldMetadata,
      targetCompositeProperty,
    };
  }

  if (isDefined(targetPropertyName)) {
    if (strictValidation) {
      throwInvalidOrderByInput(
        `Field "${path[0]}.${targetFieldName}" does not support nested ordering`,
      );
    }

    return null;
  }

  return {
    kind: 'relation',
    path,
    direction,
    fieldMetadata,
    targetFieldMetadata,
  };
};

// Single source of truth for walking an orderBy: every entry is flattened into
// ordered leaves that carry their own direction, and the SQL order parser
// compiles its clauses from these leaves, so the SQL ordering, column
// selection, cursor encoding, cursor validation and keyset conditions all
// consume the same list and cannot drift apart. Duplicated leaves keep their
// first occurrence, which lets callers append the id tie-breaker untouched: a
// caller-provided id ordering wins over the appended default.
// Strict validation rejects unknown or malformed entries; the lenient mode
// skips them instead, for callers that re-walk an already-validated orderBy
// against another object (e.g. nested connections).
export const resolveOrderByLeaves = ({
  orderBy,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  strictValidation = false,
  objectsPermissions,
}: {
  orderBy: ObjectRecordOrderBy | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  // Needed to resolve relation leaves against their target object; without it
  // they stay unresolved, which lenient callers tolerate
  flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  strictValidation?: boolean;
  // Sort values embed into cursors, so ordering by a field the role cannot
  // read is rejected like filtering by one is
  objectsPermissions?: ObjectsPermissions;
}): OrderByLeaf[] => {
  if (!isDefined(orderBy) || !isNonEmptyArray(orderBy)) {
    return [];
  }

  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  const leaves: OrderByLeaf[] = [];
  const seenPaths = new Set<string>();

  const pushLeaf = (leaf: OrderByLeaf): void => {
    const pathKey = leaf.path.join('.');

    if (seenPaths.has(pathKey)) {
      return;
    }
    seenPaths.add(pathKey);
    leaves.push(leaf);
  };

  for (const orderByEntry of orderBy) {
    for (const [fieldName, orderByValue] of Object.entries(orderByEntry)) {
      const { fieldMetadata, isReferencedByFieldName } =
        resolveFilterKeyFieldMetadata({
          filterKey: fieldName,
          fieldIdByName,
          fieldIdByJoinColumnName,
          flatFieldMetadataMaps,
        });

      if (!isDefined(fieldMetadata)) {
        if (strictValidation) {
          throw new GraphqlQueryRunnerException(
            `Field "${fieldName}" does not exist or is not sortable`,
            GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
            { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
          );
        }
        continue;
      }

      assertFieldIsReadableOrThrow({
        objectsPermissions,
        objectMetadataId: flatObjectMetadata.id,
        fieldMetadataId: fieldMetadata.id,
      });

      if (
        isReferencedByFieldName &&
        isMorphOrRelationFlatFieldMetadata(fieldMetadata)
      ) {
        if (!isPlainObject(orderByValue)) {
          if (strictValidation) {
            throwInvalidOrderByInput(
              `Relation field "${fieldName}" requires nested field ordering (e.g., { ${fieldName}: { fieldName: 'AscNullsFirst' } })`,
            );
          }
          continue;
        }

        const flattenedRelationPaths = flattenNestedOrderByValue(orderByValue);

        // An entry whose nested values are no directions at all would
        // otherwise order by nothing without telling the caller
        if (flattenedRelationPaths.length === 0 && strictValidation) {
          throwInvalidOrderByInput(
            `Relation field "${fieldName}" requires nested field ordering (e.g., { ${fieldName}: { fieldName: 'AscNullsFirst' } })`,
          );
        }

        for (const { path, direction } of flattenedRelationPaths) {
          const relationLeaf = resolveRelationLeaf({
            fieldMetadata,
            path: [fieldName, ...path],
            direction,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            strictValidation,
            objectsPermissions,
          });

          if (isDefined(relationLeaf)) {
            pushLeaf(relationLeaf);
          }
        }
        continue;
      }

      if (
        isReferencedByFieldName &&
        isCompositeFieldMetadataType(fieldMetadata.type)
      ) {
        if (!isPlainObject(orderByValue)) {
          if (strictValidation) {
            throwInvalidOrderByInput(
              `Composite field "${fieldName}" requires subfield ordering (e.g., { ${fieldName}: { subFieldName: 'AscNullsFirst' } })`,
            );
          }
          continue;
        }

        const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

        for (const [propertyName, direction] of Object.entries(orderByValue)) {
          const compositeProperty = compositeType?.properties.find(
            (property) => property.name === propertyName,
          );

          if (!isDefined(compositeProperty)) {
            if (strictValidation) {
              throwInvalidOrderByInput(
                `Sub field "${propertyName}" not found for composite field "${fieldName}"`,
              );
            }
            continue;
          }

          if (!isOrderByDirection(direction)) {
            if (strictValidation) {
              throwInvalidOrderByInput(
                `Composite sub field "${fieldName}.${propertyName}" requires a direction value (AscNullsFirst, AscNullsLast, DescNullsFirst, DescNullsLast)`,
              );
            }
            continue;
          }

          pushLeaf({
            kind: 'composite',
            path: [fieldName, propertyName],
            direction,
            fieldMetadata,
            compositeProperty,
          });
        }
        continue;
      }

      if (!isOrderByDirection(orderByValue)) {
        if (strictValidation) {
          throwInvalidOrderByInput(
            `Scalar field "${fieldName}" requires a direction value (AscNullsFirst, AscNullsLast, DescNullsFirst, DescNullsLast)`,
          );
        }
        continue;
      }

      pushLeaf({
        kind: 'scalar',
        path: [fieldName],
        direction: orderByValue,
        fieldMetadata,
      });
    }
  }

  return leaves;
};

// Rebuilds the canonical orderBy the SQL order parser consumes, one entry per
// leaf, so the scan order and the keyset conditions derive from the same
// deduplicated list.
export const buildOrderByFromLeaves = (
  leaves: OrderByLeaf[],
): ObjectRecordOrderBy =>
  leaves.map(
    ({ path, direction }) =>
      path.reduceRight<unknown>(
        (nested, key) => ({ [key]: nested }),
        direction,
      ) as ObjectRecordOrderBy[number],
  );

// Reads the leaf's value out of a decoded cursor. Composite values of legacy
// cursors were carried under dotted keys (e.g. "name.firstName").
export const getCursorValueForLeaf = (
  cursor: Record<string, unknown>,
  leaf: OrderByLeaf,
): unknown => {
  let value: unknown = cursor;

  for (const key of leaf.path) {
    if (!isPlainObject(value)) {
      value = undefined;
      break;
    }
    value = value[key];
  }

  if (value === undefined && leaf.path.length > 1) {
    return cursor[leaf.path.join('.')];
  }

  return value;
};
