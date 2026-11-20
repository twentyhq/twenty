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

import { type CommonRelationsAggregatedValues } from 'src/engine/api/common/types/common-aggregated-values.type';
import { CONNECTION_MAX_DEPTH } from 'src/engine/api/common/constants/connection-max-depth.constant';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { encodeCursor } from 'src/engine/api/common/utils/cursors.util';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/common/utils/get-target-object-metadata.util';
import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type GraphqlFieldSelection } from 'src/engine/api/graphql/workspace-resolver-builder/types/graphql-field-selection.type';
import {
  type GraphqlConnectionResult,
  type GraphqlResolverResult,
} from 'src/engine/api/graphql/direct-execution/types/graphql-resolver-result.type';
import { computeSelectionKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/compute-selection-key.util';
import { getCompositeSubFieldObjectTypeName } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-composite-sub-field-gql-types.util';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FormatArgs = {
  fieldSelections: GraphqlFieldSelection[];
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
};

type RecordFormatArgs = FormatArgs & {
  relationAggregatedValues?: CommonRelationsAggregatedValues;
  // Nested connections encode their cursors with the root order
  order?: ObjectRecordOrderBy;
  depth: number;
};

// Response keys are only ever written here: rows are keyed by field name, relations by selection key
export const graphQLFormatResultFromSelectedFields = ({
  result,
  ...formatArgs
}: FormatArgs & { result: GraphqlResolverResult }): unknown => {
  switch (result.kind) {
    case 'record':
      return isDefined(result.record)
        ? formatObjectRecord({
            record: result.record,
            relationAggregatedValues: result.relationAggregatedValues,
            depth: 0,
            ...formatArgs,
          })
        : result.record;
    case 'records':
      return result.records.map((record) =>
        formatObjectRecord({
          record,
          relationAggregatedValues: result.relationAggregatedValues,
          depth: 0,
          ...formatArgs,
        }),
      );
    case 'connection':
      return formatConnection({
        connection: result.connection,
        depth: 0,
        ...formatArgs,
      });
    case 'connections':
      return result.connections.map((connection) =>
        formatConnection({ connection, depth: 0, ...formatArgs }),
      );
    case 'groupByConnections':
      return result.connections.map((connection) =>
        formatConnection({
          connection,
          connectionTypename: getGroupByConnectionTypename(
            formatArgs.flatObjectMetadata.nameSingular,
          ),
          depth: 0,
          ...formatArgs,
        }),
      );
  }
};

const formatObjectRecord = ({
  record,
  fieldSelections,
  ...formatArgs
}: RecordFormatArgs & { record: ObjectRecord }): Record<string, unknown> => {
  if (formatArgs.depth >= CONNECTION_MAX_DEPTH) {
    throw new CommonQueryRunnerException(
      `Maximum depth of ${CONNECTION_MAX_DEPTH} reached`,
      CommonQueryRunnerExceptionCode.MAX_DEPTH_REACHED,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  return Object.fromEntries(
    fieldSelections.map((fieldSelection) => [
      fieldSelection.responseKey,
      formatObjectRecordField({ record, fieldSelection, ...formatArgs }),
    ]),
  );
};

const formatObjectRecordField = ({
  record,
  fieldSelection,
  flatObjectMetadata,
  relationAggregatedValues,
  order,
  depth,
  ...metadataMaps
}: Omit<RecordFormatArgs, 'fieldSelections'> & {
  record: ObjectRecord;
  fieldSelection: GraphqlFieldSelection;
}): unknown => {
  const { fieldName, selections } = fieldSelection;

  if (fieldName === '__typename') {
    return getNodeTypename(flatObjectMetadata.nameSingular);
  }

  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      metadataMaps.flatFieldMetadataMaps,
      flatObjectMetadata,
    );
  const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldIdByName[fieldName],
    flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
  });

  if (!isDefined(fieldMetadata)) {
    return isDefined(fieldIdByJoinColumnName[fieldName])
      ? (record[fieldName] ?? null)
      : null;
  }

  if (isMorphOrRelationFlatFieldMetadata(fieldMetadata)) {
    const selectionKey = computeSelectionKey(fieldSelection);
    const relationValue: ObjectRecord | ObjectRecord[] | null | undefined =
      record[selectionKey];
    const relationFormatArgs: RecordFormatArgs = {
      fieldSelections: selections,
      flatObjectMetadata: getTargetObjectMetadataOrThrow(
        fieldMetadata,
        metadataMaps.flatObjectMetadataMaps,
      ),
      relationAggregatedValues:
        relationAggregatedValues?.[selectionKey]?.relations,
      order,
      depth: depth + 1,
      ...metadataMaps,
    };

    if (fieldMetadata.settings.relationType === RelationType.ONE_TO_MANY) {
      const relationRecords = Array.isArray(relationValue) ? relationValue : [];
      const aggregatedValues =
        relationAggregatedValues?.[selectionKey]?.valuesByParentRecordId[
          record.id
        ];

      return formatConnection({
        connection: {
          records: relationRecords,
          connectionValues: {
            ...aggregatedValues,
            totalCount: aggregatedValues?.totalCount ?? relationRecords.length,
          },
          relationAggregatedValues: relationFormatArgs.relationAggregatedValues,
          hasNextPage: false,
          hasPreviousPage: false,
          order,
        },
        ...relationFormatArgs,
      });
    }

    if (!isDefined(relationValue) || Array.isArray(relationValue)) {
      return null;
    }

    return formatObjectRecord({ record: relationValue, ...relationFormatArgs });
  }

  const value = record[fieldName];

  if (!isDefined(value)) {
    return null;
  }

  return selections.length > 0 &&
    isCompositeFieldMetadataType(fieldMetadata.type)
    ? formatCompositeField({
        value,
        fieldSelections: selections,
        fieldMetadataType: fieldMetadata.type,
      })
    : value;
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
  depth,
  ...formatArgs
}: FormatArgs & {
  connection: GraphqlConnectionResult;
  connectionTypename?: string;
  depth: number;
}): Record<string, unknown> => {
  const { nameSingular } = formatArgs.flatObjectMetadata;
  const computeCursor = (record: ObjectRecord | undefined): string | null =>
    isDefined(record)
      ? encodeCursor({
          objectRecord: record,
          order: connection.order,
          orderByValuesFromScan:
            connection.orderByValuesByRecordId?.[record.id],
          ...formatArgs,
        })
      : null;
  const formatPageInfoField = (
    pageInfoFieldName: string,
  ): string | boolean | null => {
    switch (pageInfoFieldName) {
      case '__typename':
        return 'PageInfo';
      case 'hasNextPage':
        return connection.hasNextPage;
      case 'hasPreviousPage':
        return connection.hasPreviousPage;
      case 'startCursor':
        return computeCursor(connection.records[0]);
      case 'endCursor':
        return computeCursor(connection.records[connection.records.length - 1]);
      default:
        return null;
    }
  };
  const formatEdgeField = ({
    record,
    edgeSelection: { fieldName, selections },
  }: {
    record: ObjectRecord;
    edgeSelection: GraphqlFieldSelection;
  }): string | Record<string, unknown> | null => {
    switch (fieldName) {
      case '__typename':
        return getEdgeTypename(nameSingular);
      case 'cursor':
        return computeCursor(record);
      case 'node':
        return formatObjectRecord({
          record,
          fieldSelections: selections,
          relationAggregatedValues: connection.relationAggregatedValues,
          order: connection.order,
          depth,
          ...formatArgs,
        });
      default:
        return null;
    }
  };

  return Object.fromEntries(
    fieldSelections.map(({ responseKey, fieldName, selections }) => {
      switch (fieldName) {
        case '__typename':
          return [
            responseKey,
            connectionTypename ?? getConnectionTypename(nameSingular),
          ];
        case 'edges':
          return [
            responseKey,
            connection.records.map((record) =>
              Object.fromEntries(
                selections
                  .filter((edgeSelection) =>
                    ['__typename', 'cursor', 'node'].includes(
                      edgeSelection.fieldName,
                    ),
                  )
                  .map((edgeSelection) => [
                    edgeSelection.responseKey,
                    formatEdgeField({ record, edgeSelection }),
                  ]),
              ),
            ),
          ];
        case 'pageInfo':
          return [
            responseKey,
            Object.fromEntries(
              selections.map((pageInfoSelection) => [
                pageInfoSelection.responseKey,
                formatPageInfoField(pageInfoSelection.fieldName),
              ]),
            ),
          ];
        default: {
          const connectionValue =
            connection.connectionValues[fieldName] ?? null;

          return [
            responseKey,
            isNonEmptyString(connectionValue) &&
            isFinite(Number(connectionValue))
              ? Number(connectionValue)
              : connectionValue,
          ];
        }
      }
    }),
  );
};
