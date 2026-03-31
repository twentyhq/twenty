import { isNull } from '@sniptt/guards';
import { ObjectRecord, RelationType } from 'twenty-shared/types';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlDirectExecutionException,
  GraphqlDirectExecutionExceptionCode,
} from 'src/engine/api/graphql/direct-execution/errors/graphql-direct-execution.exception';

import {
  isConnection,
  isConnectionArray,
  isGroupByConnection,
  isObjectRecord,
  isObjectRecordArray,
} from 'src/engine/api/graphql/direct-execution/utils/graphql-is-resolver-output-type.util';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { IGroupByConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/group-by-connection.interface';
import { ResolverOutput } from 'src/engine/api/graphql/workspace-query-runner/interfaces/resolver-output';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  getConnectionTypename,
  getEdgeTypename,
  getGroupByConnectionTypename,
  getNodeTypename,
  isDefined,
  isEmptyObject,
  pascalCase,
} from 'twenty-shared/utils';

type GraphQLFormatInput = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectIdByNameSingular: Record<string, string>;
  method: string;
};

type GraphQLFormatContext = GraphQLFormatInput & {
  fieldMetadataByNameCache: Map<string, Map<string, FlatFieldMetadata>>;
};

export const graphQLFormatResultFromSelectedFields = (
  result: ResolverOutput,
  selectedFields: Record<string, object>,
  objectNameSingular: string,
  input: GraphQLFormatInput,
): unknown => {
  const context: GraphQLFormatContext = {
    ...input,
    fieldMetadataByNameCache: new Map(),
  };

  if (isObjectRecord(result)) {
    return backfillNullValuesAndComputeTypeNameForObjectRecord(
      result,
      selectedFields,
      objectNameSingular,
      context,
    );
  }

  if (isObjectRecordArray(result)) {
    return result.map((item) =>
      backfillNullValuesAndComputeTypeNameForObjectRecord(
        item,
        selectedFields,
        objectNameSingular,
        context,
      ),
    );
  }

  if (isGroupByConnection(result)) {
    return backfillNullValuesAndComputeTypeNameForGroupByConnection(
      result,
      selectedFields,
      objectNameSingular,
      context,
    );
  }

  if (isConnection(result)) {
    return backfillNullValuesAndComputeTypeNameForConnection(
      result,
      selectedFields,
      objectNameSingular,
      context,
    );
  }

  if (isConnectionArray(result)) {
    return backfillNullValuesAndComputeTypeNameForConnectionArray(
      result,
      selectedFields,
      objectNameSingular,
      context,
    );
  }

  if (result === null || result === undefined) {
    return result;
  }

  throw new GraphqlDirectExecutionException(
    'Invalid result type',
    GraphqlDirectExecutionExceptionCode.INVALID_RESULT_TYPE,
    { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
  );
};

const backfillNullValuesAndComputeTypeNameForObjectRecord = (
  record: ObjectRecord,
  selectedFields: Record<string, object>,
  objectNameSingular: string,
  context: GraphQLFormatContext,
): Record<string, unknown> => {
  const formatted: Record<string, unknown> = {};

  for (const [key, subFields] of Object.entries(selectedFields)) {
    if (key === '__typename') {
      formatted.__typename = getNodeTypename(objectNameSingular);
      continue;
    }

    if (!isDefined(record[key])) {
      formatted[key] = null;
      continue;
    }

    const value = record[key];

    const hasNestedFields = isDefined(subFields) && !isEmptyObject(subFields);

    if (!hasNestedFields || isNull(value)) {
      formatted[key] = value;
      continue;
    }

    const relationInfo = findRelationInfo(objectNameSingular, key, context);

    if (isDefined(relationInfo)) {
      if (relationInfo.relationType === RelationType.ONE_TO_MANY) {
        formatted[key] = backfillNullValuesAndComputeTypeNameForConnection(
          value as IConnection<ObjectRecord, IEdge<ObjectRecord>>,
          subFields as Record<string, object>,
          relationInfo.targetObjectNameSingular,
          context,
        );
      } else {
        formatted[key] = backfillNullValuesAndComputeTypeNameForObjectRecord(
          value,
          subFields as Record<string, object>,
          relationInfo.targetObjectNameSingular,
          context,
        );
      }
      continue;
    }

    const fieldMetadata = findFieldMetadataByName(
      objectNameSingular,
      key,
      context,
    );

    if (
      isDefined(fieldMetadata) &&
      isCompositeFieldMetadataType(fieldMetadata.type)
    ) {
      formatted[key] = backfillNullValuesAndComputeTypeNameForCompositeField(
        value as Record<string, unknown>,
        subFields as Record<string, object>,
        fieldMetadata.type,
      );
      continue;
    }

    formatted[key] = value;
  }

  return formatted;
};

const backfillNullValuesAndComputeTypeNameForCompositeField = (
  record: Record<string, unknown>,
  selectedFields: Record<string, object>,
  fieldMetadataType: string,
): Record<string, unknown> => {
  const formatted: Record<string, unknown> = {};

  for (const key of Object.keys(selectedFields)) {
    if (key === '__typename') {
      formatted.__typename = pascalCase(fieldMetadataType);
      continue;
    }

    formatted[key] = record[key] ?? null;
  }

  return formatted;
};

const backfillNullValuesAndComputeTypeNameForConnection = (
  connection: IConnection<ObjectRecord, IEdge<ObjectRecord>>,
  selectedFields: Record<string, object>,
  objectNameSingular: string,
  context: GraphQLFormatContext,
): Record<string, unknown> => {
  const formatted: Record<string, unknown> = {};

  for (const [key, subFields] of Object.entries(selectedFields)) {
    if (key === '__typename') {
      formatted.__typename = getConnectionTypename(objectNameSingular);
      continue;
    }

    if (key === 'edges') {
      formatted.edges = connection.edges.map((edge) => {
        const edgeFormatted: Record<string, unknown> = {};

        for (const [edgeKey, edgeSubFields] of Object.entries(
          subFields as Record<string, object>,
        )) {
          if (edgeKey === '__typename') {
            edgeFormatted.__typename = getEdgeTypename(objectNameSingular);
            continue;
          }

          if (edgeKey === 'cursor') {
            edgeFormatted.cursor = edge.cursor;
            continue;
          }

          if (edgeKey === 'node') {
            edgeFormatted.node =
              backfillNullValuesAndComputeTypeNameForObjectRecord(
                edge.node,
                edgeSubFields as Record<string, object>,
                objectNameSingular,
                context,
              );
            continue;
          }
        }

        return edgeFormatted;
      });
      continue;
    }

    if (key === 'pageInfo') {
      const pageInfoFormatted: Record<string, unknown> = {};

      for (const pageInfoKey of Object.keys(
        subFields as Record<string, object>,
      )) {
        if (pageInfoKey === '__typename') {
          pageInfoFormatted.__typename = 'PageInfo';
          continue;
        }

        pageInfoFormatted[pageInfoKey] =
          (connection.pageInfo as unknown as Record<string, unknown>)[
            pageInfoKey
          ] ?? null;
      }

      formatted.pageInfo = pageInfoFormatted;
      continue;
    }

    //aggregate fields
    formatted[key] =
      (connection as unknown as Record<string, unknown>)[key] ?? null;
  }

  return formatted;
};

const backfillNullValuesAndComputeTypeNameForGroupByConnection = (
  connection: IGroupByConnection<ObjectRecord, IEdge<ObjectRecord>>,
  selectedFields: Record<string, object>,
  objectNameSingular: string,
  context: GraphQLFormatContext,
): Record<string, unknown> => {
  const formatted = backfillNullValuesAndComputeTypeNameForConnection(
    connection,
    selectedFields,
    objectNameSingular,
    context,
  );

  if ('__typename' in selectedFields) {
    formatted.__typename = getGroupByConnectionTypename(objectNameSingular);
  }

  if ('groupByDimensionValues' in selectedFields) {
    formatted.groupByDimensionValues = connection.groupByDimensionValues;
  }

  return formatted;
};

const backfillNullValuesAndComputeTypeNameForConnectionArray = (
  connections: IConnection<ObjectRecord, IEdge<ObjectRecord>>[],
  selectedFields: Record<string, object>,
  objectNameSingular: string,
  context: GraphQLFormatContext,
): Record<string, unknown>[] => {
  return connections.map((connection) =>
    backfillNullValuesAndComputeTypeNameForConnection(
      connection,
      selectedFields,
      objectNameSingular,
      context,
    ),
  );
};

const getOrBuildFieldMetadataByNameMap = (
  objectNameSingular: string,
  context: GraphQLFormatContext,
): Map<string, FlatFieldMetadata> => {
  const cached = context.fieldMetadataByNameCache.get(objectNameSingular);

  if (isDefined(cached)) {
    return cached;
  }

  const map = new Map<string, FlatFieldMetadata>();
  const objectId = context.objectIdByNameSingular[objectNameSingular];

  if (!isDefined(objectId)) {
    context.fieldMetadataByNameCache.set(objectNameSingular, map);

    return map;
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: objectId,
    flatEntityMaps: context.flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    context.fieldMetadataByNameCache.set(objectNameSingular, map);

    return map;
  }

  for (const fieldId of flatObjectMetadata.fieldIds) {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: context.flatFieldMetadataMaps,
    });

    if (isDefined(fieldMetadata)) {
      map.set(fieldMetadata.name, fieldMetadata);
    }
  }

  context.fieldMetadataByNameCache.set(objectNameSingular, map);

  return map;
};

const findFieldMetadataByName = (
  objectNameSingular: string,
  fieldName: string,
  context: GraphQLFormatContext,
): FlatFieldMetadata | undefined => {
  return getOrBuildFieldMetadataByNameMap(objectNameSingular, context).get(
    fieldName,
  );
};

type RelationInfo = {
  targetObjectNameSingular: string;
  relationType: RelationType;
};

const findRelationInfo = (
  objectNameSingular: string,
  fieldName: string,
  context: GraphQLFormatContext,
): RelationInfo | undefined => {
  const fieldMetadata = findFieldMetadataByName(
    objectNameSingular,
    fieldName,
    context,
  );

  if (
    !isDefined(fieldMetadata) ||
    !isMorphOrRelationFlatFieldMetadata(fieldMetadata)
  ) {
    return undefined;
  }

  const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
    flatEntityMaps: context.flatObjectMetadataMaps,
  });

  if (!isDefined(targetObjectMetadata)) {
    return undefined;
  }

  return {
    targetObjectNameSingular: targetObjectMetadata.nameSingular,
    relationType: fieldMetadata.settings.relationType,
  };
};
