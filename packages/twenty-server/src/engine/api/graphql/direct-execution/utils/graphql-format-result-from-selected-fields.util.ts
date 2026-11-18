import { isNonEmptyString, isNull } from '@sniptt/guards';
import {
  type FieldMetadataType,
  type ObjectRecord,
  RelationType,
} from 'twenty-shared/types';
import {
  getConnectionTypename,
  getEdgeTypename,
  getGroupByConnectionTypename,
  getNodeTypename,
  isDefined,
  isPlainObject,
  pascalCase,
} from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
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
import { type IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { type IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { type ResolverOutput } from 'src/engine/api/graphql/workspace-query-runner/interfaces/resolver-output';
import { type GraphqlFieldSelection } from 'src/engine/api/graphql/workspace-resolver-builder/types/graphql-field-selection.type';
import { computeSelectionKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/compute-selection-key.util';
import { getCompositeSubFieldObjectTypeName } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-composite-sub-field-gql-types.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ObjectRecordConnection = IConnection<ObjectRecord, IEdge<ObjectRecord>>;

type GraphqlFormatContext = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  objectIdByNameSingular: Record<string, string>;
  fieldMetadataByNameCache: Map<string, Map<string, OrmFlatFieldMetadata>>;
};

type FormatArgs = {
  fieldSelections: GraphqlFieldSelection[];
  objectNameSingular: string;
  context: GraphqlFormatContext;
};

// Response keys are only ever written here: rows are keyed by field name, relations by selection key
export const graphQLFormatResultFromSelectedFields = ({
  result,
  fieldSelections,
  objectNameSingular,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular,
}: {
  result: ResolverOutput;
  fieldSelections: GraphqlFieldSelection[];
  objectNameSingular: string;
} & Omit<GraphqlFormatContext, 'fieldMetadataByNameCache'>): unknown => {
  const formatArgs: FormatArgs = {
    fieldSelections,
    objectNameSingular,
    context: {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
      fieldMetadataByNameCache: new Map(),
    },
  };

  if (isObjectRecord(result)) {
    return formatObjectRecord({ record: result, ...formatArgs });
  }

  if (isObjectRecordArray(result)) {
    return result.map((record) =>
      formatObjectRecord({ record, ...formatArgs }),
    );
  }

  if (isGroupByConnection(result)) {
    return formatConnection({
      connection: result,
      connectionTypename: getGroupByConnectionTypename(objectNameSingular),
      ...formatArgs,
    });
  }

  if (isConnection(result)) {
    return formatConnection({ connection: result, ...formatArgs });
  }

  if (isConnectionArray(result)) {
    return result.map((connection) =>
      formatConnection({ connection, ...formatArgs }),
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

const formatObjectRecord = ({
  record,
  fieldSelections,
  ...formatArgs
}: FormatArgs & { record: ObjectRecord }): Record<string, unknown> =>
  Object.fromEntries(
    fieldSelections.map((fieldSelection) => [
      fieldSelection.responseKey,
      formatObjectRecordField({ record, fieldSelection, ...formatArgs }),
    ]),
  );

const formatObjectRecordField = ({
  record,
  fieldSelection,
  objectNameSingular,
  context,
}: Omit<FormatArgs, 'fieldSelections'> & {
  record: ObjectRecord;
  fieldSelection: GraphqlFieldSelection;
}): unknown => {
  const { fieldName, selections } = fieldSelection;

  if (fieldName === '__typename') {
    return getNodeTypename(objectNameSingular);
  }

  const relationInfo = findRelationInfo({
    objectNameSingular,
    fieldName,
    context,
  });

  if (isDefined(relationInfo)) {
    const relationValue = record[computeSelectionKey(fieldSelection)];

    if (!isDefined(relationValue)) {
      return null;
    }

    const relationFormatArgs: FormatArgs = {
      fieldSelections: selections,
      objectNameSingular: relationInfo.targetObjectNameSingular,
      context,
    };

    return relationInfo.relationType === RelationType.ONE_TO_MANY
      ? formatConnection({ connection: relationValue, ...relationFormatArgs })
      : formatObjectRecord({ record: relationValue, ...relationFormatArgs });
  }

  const value = record[fieldName];

  if (!isDefined(value)) {
    return null;
  }

  const fieldMetadata = getFieldMetadataByName({
    objectNameSingular,
    context,
  }).get(fieldName);

  if (
    selections.length === 0 ||
    !isDefined(fieldMetadata) ||
    !isCompositeFieldMetadataType(fieldMetadata.type)
  ) {
    return value;
  }

  return formatCompositeField({
    value,
    fieldSelections: selections,
    fieldMetadataType: fieldMetadata.type,
  });
};

const formatCompositeField = ({
  value,
  fieldSelections,
  fieldMetadataType,
}: {
  value: Record<string, unknown>;
  fieldSelections: GraphqlFieldSelection[];
  fieldMetadataType: FieldMetadataType;
}): Record<string, unknown> =>
  Object.fromEntries(
    fieldSelections.map(({ responseKey, fieldName, selections }) => {
      if (fieldName === '__typename') {
        return [responseKey, pascalCase(fieldMetadataType)];
      }

      const subFieldValue = value[fieldName] ?? null;
      const subFieldTypename = getCompositeSubFieldObjectTypeName(
        fieldMetadataType,
        fieldName,
      );

      if (
        !isDefined(subFieldTypename) ||
        isNull(subFieldValue) ||
        selections.length === 0
      ) {
        return [responseKey, subFieldValue];
      }

      return [
        responseKey,
        Array.isArray(subFieldValue)
          ? subFieldValue.map((item) =>
              formatCompositeSubField({
                value: item,
                fieldSelections: selections,
                typename: subFieldTypename,
              }),
            )
          : formatCompositeSubField({
              value: subFieldValue,
              fieldSelections: selections,
              typename: subFieldTypename,
            }),
      ];
    }),
  );

const formatCompositeSubField = ({
  value,
  fieldSelections,
  typename,
}: {
  value: unknown;
  fieldSelections: GraphqlFieldSelection[];
  typename: string;
}): unknown => {
  if (!isPlainObject(value)) {
    return value;
  }

  return Object.fromEntries(
    fieldSelections.map(({ responseKey, fieldName }) => [
      responseKey,
      fieldName === '__typename' ? typename : (value[fieldName] ?? null),
    ]),
  );
};

const formatConnection = ({
  connection,
  connectionTypename,
  fieldSelections,
  ...formatArgs
}: FormatArgs & {
  connection: ObjectRecordConnection;
  connectionTypename?: string;
}): Record<string, unknown> => {
  const connectionValues: Record<string, unknown> = connection;
  const pageInfoValues: Record<string, unknown> = connection.pageInfo;

  return Object.fromEntries(
    fieldSelections.map(({ responseKey, fieldName, selections }) => {
      switch (fieldName) {
        case '__typename':
          return [
            responseKey,
            connectionTypename ??
              getConnectionTypename(formatArgs.objectNameSingular),
          ];
        case 'edges':
          return [
            responseKey,
            connection.edges.map((edge) =>
              formatEdge({ edge, fieldSelections: selections, ...formatArgs }),
            ),
          ];
        case 'pageInfo':
          return [
            responseKey,
            Object.fromEntries(
              selections.map((pageInfoSelection) => [
                pageInfoSelection.responseKey,
                pageInfoSelection.fieldName === '__typename'
                  ? 'PageInfo'
                  : (pageInfoValues[pageInfoSelection.fieldName] ?? null),
              ]),
            ),
          ];
        default: {
          const aggregateValue = connectionValues[fieldName] ?? null;

          return [
            responseKey,
            isNonEmptyString(aggregateValue) && isFinite(Number(aggregateValue))
              ? Number(aggregateValue)
              : aggregateValue,
          ];
        }
      }
    }),
  );
};

const formatEdge = ({
  edge,
  fieldSelections,
  ...formatArgs
}: FormatArgs & { edge: IEdge<ObjectRecord> }): Record<string, unknown> =>
  Object.fromEntries(
    fieldSelections.flatMap(
      ({ responseKey, fieldName, selections }): [string, unknown][] => {
        switch (fieldName) {
          case '__typename':
            return [
              [responseKey, getEdgeTypename(formatArgs.objectNameSingular)],
            ];
          case 'cursor':
            return [[responseKey, edge.cursor]];
          case 'node':
            return [
              [
                responseKey,
                formatObjectRecord({
                  record: edge.node,
                  fieldSelections: selections,
                  ...formatArgs,
                }),
              ],
            ];
          default:
            return [];
        }
      },
    ),
  );

const getFieldMetadataByName = ({
  objectNameSingular,
  context,
}: Pick<FormatArgs, 'objectNameSingular' | 'context'>): Map<
  string,
  OrmFlatFieldMetadata
> => {
  const cachedFieldMetadataByName =
    context.fieldMetadataByNameCache.get(objectNameSingular);

  if (isDefined(cachedFieldMetadataByName)) {
    return cachedFieldMetadataByName;
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: context.objectIdByNameSingular[objectNameSingular],
    flatEntityMaps: context.flatObjectMetadataMaps,
  });

  const fieldMetadataByName = new Map(
    (flatObjectMetadata?.fieldIds ?? [])
      .map((fieldId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldId,
          flatEntityMaps: context.flatFieldMetadataMaps,
        }),
      )
      .filter(isDefined)
      .map((fieldMetadata) => [fieldMetadata.name, fieldMetadata]),
  );

  context.fieldMetadataByNameCache.set(objectNameSingular, fieldMetadataByName);

  return fieldMetadataByName;
};

const findRelationInfo = ({
  objectNameSingular,
  fieldName,
  context,
}: Pick<FormatArgs, 'objectNameSingular' | 'context'> & {
  fieldName: string;
}):
  | { targetObjectNameSingular: string; relationType: RelationType }
  | undefined => {
  const fieldMetadata = getFieldMetadataByName({
    objectNameSingular,
    context,
  }).get(fieldName);

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
