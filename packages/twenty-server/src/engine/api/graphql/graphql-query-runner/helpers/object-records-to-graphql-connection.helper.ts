import { FieldMetadataType } from 'twenty-shared';

import {
  ObjectRecord,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { CONNECTION_MAX_DEPTH } from 'src/engine/api/graphql/graphql-query-runner/constants/connection-max-depth.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { encodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { getRelationObjectMetadata } from 'src/engine/api/graphql/graphql-query-runner/utils/get-relation-object-metadata.util';
import { AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { isDefined } from 'src/utils/is-defined';
import { isPlainObject } from 'src/utils/is-plain-object';

export class ObjectRecordsToGraphqlConnectionHelper {
  private objectMetadataMaps: ObjectMetadataMaps;

  constructor(objectMetadataMaps: ObjectMetadataMaps) {
    this.objectMetadataMaps = objectMetadataMaps;
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
    objectRecordsAggregatedValues?: Record<string, any>;
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
    objectRecordsAggregatedValues?: Record<string, any>;
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
      );
    }

    const objectMetadata = getObjectMetadataMapItemByNameSingular(
      this.objectMetadataMaps,
      objectName,
    );

    if (!objectMetadata) {
      throw new GraphqlQueryRunnerException(
        `Object metadata not found for ${objectName}`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const processedObjectRecord: Record<string, any> = {};

    for (const [key, value] of Object.entries(objectRecord)) {
      const fieldMetadata = objectMetadata.fieldsByName[key];

      if (!fieldMetadata) {
        processedObjectRecord[key] = value;
        continue;
      }

      if (isRelationFieldMetadataType(fieldMetadata.type)) {
        if (Array.isArray(value)) {
          processedObjectRecord[key] = this.createConnection({
            objectRecords: value,
            parentObjectRecord: objectRecord,
            objectRecordsAggregatedValues:
              objectRecordsAggregatedValues[fieldMetadata.name],
            selectedAggregatedFields:
              selectedAggregatedFields[fieldMetadata.name],
            objectName: getRelationObjectMetadata(
              fieldMetadata,
              this.objectMetadataMaps,
            ).nameSingular,
            take,
            totalCount:
              objectRecordsAggregatedValues[fieldMetadata.name]?.totalCount ??
              value.length,
            order,
            hasNextPage: false,
            hasPreviousPage: false,
            depth: depth + 1,
          });
        } else if (isPlainObject(value)) {
          processedObjectRecord[key] = this.processRecord({
            objectRecord: value,
            objectRecordsAggregatedValues:
              objectRecordsAggregatedValues[fieldMetadata.name],
            selectedAggregatedFields:
              selectedAggregatedFields[fieldMetadata.name],
            objectName: getRelationObjectMetadata(
              fieldMetadata,
              this.objectMetadataMaps,
            ).nameSingular,
            take,
            totalCount,
            order,
            depth: depth + 1,
          });
        }
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        processedObjectRecord[key] = this.processCompositeField(
          fieldMetadata,
          value,
        );
      } else {
        processedObjectRecord[key] = this.formatFieldValue(
          value,
          fieldMetadata.type,
        );
      }
    }

    return processedObjectRecord as T;
  }

  private processCompositeField(
    fieldMetadata: FieldMetadataInterface,
    fieldValue: any,
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
      {} as Record<string, any>,
    );
  }

  private formatFieldValue(value: any, fieldType: FieldMetadataType) {
    switch (fieldType) {
      case FieldMetadataType.RAW_JSON:
        return value ? JSON.stringify(value) : value;
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME:
        return value instanceof Date ? value.toISOString() : value;
      default:
        return value;
    }
  }
}
