import {
  compositeTypeDefinitions,
  FieldMetadataType,
  type ObjectRecord,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CONNECTION_MAX_DEPTH } from 'src/engine/api/graphql/graphql-query-runner/constants/connection-max-depth.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { encodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { isPlainObject } from 'src/utils/is-plain-object';

// TODO: Refacto-common - Rename CommonRecordsToGraphqlConnectionHelper
export class ObjectRecordsToGraphqlConnectionHelper {
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  private objectIdByNameSingular: Record<string, string>;

  constructor(
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    objectIdByNameSingular: Record<string, string>,
  ) {
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;
    this.objectIdByNameSingular = objectIdByNameSingular;
  }

  public createConnection<T extends ObjectRecord = ObjectRecord>({
    objectRecords,
    parentObjectRecord,
    objectRecordsAggregatedValues = {},
    selectedAggregatedFields = [],
    objectName,
    take,
    totalCount,
    order,
    hasNextPage,
    hasPreviousPage,
    depth = 0,
  }: {
    objectRecords: T[];
    parentObjectRecord?: T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectRecordsAggregatedValues?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedAggregatedFields?: Record<string, any>;
    objectName: string;
    take: number;
    totalCount: number;
    order?: ObjectRecordOrderBy;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    depth?: number;
  }): IConnection<T> {
    const edges = (objectRecords ?? []).map((objectRecord) => ({
      node: this.processRecord({
        objectRecord,
        objectName,
        objectRecordsAggregatedValues,
        selectedAggregatedFields,
        take,
        totalCount,
        order,
        depth,
      }),
      cursor: encodeCursor(objectRecord, order),
    }));

    const aggregatedFieldsValues = this.extractAggregatedFieldsValues({
      selectedAggregatedFields,
      objectRecordsAggregatedValues: parentObjectRecord
        ? objectRecordsAggregatedValues[parentObjectRecord.id]
        : objectRecordsAggregatedValues,
    });

    return {
      ...aggregatedFieldsValues,
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
      },
      totalCount: totalCount,
    };
  }

  private extractAggregatedFieldsValues = ({
    selectedAggregatedFields,
    objectRecordsAggregatedValues,
  }: {
    selectedAggregatedFields: Record<string, AggregationField[]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectRecordsAggregatedValues: Record<string, any>;
  }) => {
    if (!isDefined(objectRecordsAggregatedValues)) {
      return {};
    }

    return Object.entries(selectedAggregatedFields).reduce(
      (acc, [aggregatedFieldName]) => {
        const aggregatedFieldValue =
          objectRecordsAggregatedValues[aggregatedFieldName];

        if (!isDefined(aggregatedFieldValue)) {
          return acc;
        }

        return {
          ...acc,
          [aggregatedFieldName]:
            objectRecordsAggregatedValues[aggregatedFieldName],
        };
      },
      {},
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public processRecord<T extends Record<string, any>>({
    objectRecord,
    objectName,
    objectRecordsAggregatedValues = {},
    selectedAggregatedFields = [],
    take,
    totalCount,
    order,
    depth = 0,
  }: {
    objectRecord: T;
    objectName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectRecordsAggregatedValues?: Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedAggregatedFields?: Record<string, any>;
    take: number;
    totalCount: number;
    order?: ObjectRecordOrderBy;
    depth?: number;
  }): T {
    if (depth >= CONNECTION_MAX_DEPTH) {
      throw new GraphqlQueryRunnerException(
        `Maximum depth of ${CONNECTION_MAX_DEPTH} reached`,
        GraphqlQueryRunnerExceptionCode.MAX_DEPTH_REACHED,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const objectMetadataId = this.objectIdByNameSingular[objectName];

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: this.flatObjectMetadataMaps,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processedObjectRecord: Record<string, any> = {};

    for (const fieldId of flatObjectMetadata.fieldMetadataIds) {
      const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: fieldId,
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const objectValue = objectRecord[fieldMetadata.name];

        if (!isDefined(objectValue)) {
          continue;
        }
        processedObjectRecord[fieldMetadata.name] = this.processCompositeField(
          fieldMetadata,
          objectValue,
        );
        continue;
      }

      if (isMorphOrRelationFlatFieldMetadata(fieldMetadata)) {
        const targetObjectMetadata =
          this.flatObjectMetadataMaps.byId[
            fieldMetadata.relationTargetObjectMetadataId
          ];

        if (!isDefined(targetObjectMetadata)) {
          continue;
        }

        const fieldMetadataNameWithId = `${fieldMetadata.name}Id`;

        if (isDefined(objectRecord[fieldMetadataNameWithId])) {
          processedObjectRecord[fieldMetadataNameWithId] =
            objectRecord[fieldMetadataNameWithId];
        }

        const objectValue = objectRecord[fieldMetadata.name];

        if (!isDefined(objectValue)) {
          continue;
        }

        if (Array.isArray(objectValue)) {
          processedObjectRecord[fieldMetadata.name] = this.createConnection({
            objectRecords: objectValue,
            parentObjectRecord: objectRecord,
            objectRecordsAggregatedValues:
              objectRecordsAggregatedValues[fieldMetadata.name],
            selectedAggregatedFields:
              selectedAggregatedFields[fieldMetadata.name],
            objectName: targetObjectMetadata.nameSingular,
            take,
            totalCount:
              objectRecordsAggregatedValues[fieldMetadata.name]?.totalCount ??
              objectValue.length,
            order,
            hasNextPage: false,
            hasPreviousPage: false,
            depth: depth + 1,
          });
        } else if (isPlainObject(objectValue)) {
          const targetObjectMetadataOrThrow = getTargetObjectMetadataOrThrow(
            fieldMetadata,
            this.flatObjectMetadataMaps,
          );

          processedObjectRecord[fieldMetadata.name] = this.processRecord({
            objectRecord: objectValue,
            objectRecordsAggregatedValues:
              objectRecordsAggregatedValues[fieldMetadata.name],
            selectedAggregatedFields:
              selectedAggregatedFields[fieldMetadata.name],
            objectName: targetObjectMetadataOrThrow.nameSingular,
            take,
            totalCount,
            order,
            depth: depth + 1,
          });
        }
        continue;
      }

      const objectValue = objectRecord[fieldMetadata.name];

      if (!isDefined(objectValue)) {
        continue;
      }

      processedObjectRecord[fieldMetadata.name] = this.formatFieldValue(
        objectValue,
        fieldMetadata.type,
      );
    }

    return processedObjectRecord as T;
  }

  private processCompositeField(
    fieldMetadata: FlatFieldMetadata,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fieldValue: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    return Object.entries(fieldValue).reduce(
      (acc, [subFieldKey, subFieldValue]) => {
        if (subFieldKey === '__typename') return acc;

        const subFieldMetadata = compositeType.properties.find(
          (property) => property.name === subFieldKey,
        );

        if (!subFieldMetadata) {
          throw new Error(
            `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
          );
        }

        acc[subFieldKey] = this.formatFieldValue(
          subFieldValue,
          subFieldMetadata.type,
        );

        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as Record<string, any>,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatFieldValue(value: any, fieldType: FieldMetadataType) {
    switch (fieldType) {
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME:
        return value instanceof Date ? value.toISOString() : value;
      default:
        return value;
    }
  }
}
