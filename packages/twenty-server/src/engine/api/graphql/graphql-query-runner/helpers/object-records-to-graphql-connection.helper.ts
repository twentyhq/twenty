import {
  compositeTypeDefinitions,
  FieldMetadataType,
  type ObjectRecord,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { CONNECTION_MAX_DEPTH } from 'src/engine/api/graphql/graphql-query-runner/constants/connection-max-depth.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { encodeCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { type OrderByValuesByRecordId } from 'src/engine/api/utils/build-order-by-values-by-record-id.util';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// TODO: Refacto-common - Rename CommonRecordsToGraphqlConnectionHelper
export class ObjectRecordsToGraphqlConnectionHelper {
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  private objectIdByNameSingular: Record<string, string>;

  constructor(
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
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
    selection,
    objectName,
    take,
    totalCount,
    order,
    hasNextPage,
    hasPreviousPage,
    depth = 0,
    orderByValuesByRecordId,
  }: {
    objectRecords: T[];
    parentObjectRecord?: T;
    // oxlint-disable-next-line typescript/no-explicit-any
    objectRecordsAggregatedValues?: Record<string, any>;
    selection: CommonSelection;
    objectName: string;
    take: number;
    totalCount: number | undefined;
    order?: ObjectRecordOrderBy;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    depth?: number;
    orderByValuesByRecordId?: OrderByValuesByRecordId;
  }): IConnection<T> {
    const objectMetadataId = this.objectIdByNameSingular[objectName];
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: this.flatObjectMetadataMaps,
    });

    const edges = (objectRecords ?? []).map((objectRecord) => ({
      node: this.processRecord({
        objectRecord,
        objectName,
        objectRecordsAggregatedValues,
        selection,
        take,
        totalCount,
        order,
        depth,
      }),
      cursor: encodeCursor({
        objectRecord,
        order,
        flatObjectMetadata,
        flatObjectMetadataMaps: this.flatObjectMetadataMaps,
        flatFieldMetadataMaps: this.flatFieldMetadataMaps,
        orderByValuesFromScan: orderByValuesByRecordId?.[objectRecord.id],
      }),
    }));

    const aggregatedFieldsValues = this.extractAggregatedFieldsValues({
      aggregates: selection.aggregates,
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
    aggregates,
    objectRecordsAggregatedValues,
  }: {
    aggregates: CommonSelection['aggregates'];
    // oxlint-disable-next-line typescript/no-explicit-any
    objectRecordsAggregatedValues: Record<string, any>;
  }) => {
    if (!isDefined(objectRecordsAggregatedValues)) {
      return {};
    }

    return Object.keys(aggregates).reduce((acc, aggregatedFieldName) => {
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
    }, {});
  };

  // oxlint-disable-next-line typescript/no-explicit-any
  public processRecord<T extends Record<string, any>>({
    objectRecord,
    objectName,
    objectRecordsAggregatedValues = {},
    selection,
    take,
    totalCount,
    order,
    depth = 0,
  }: {
    objectRecord: T;
    objectName: string;
    // oxlint-disable-next-line typescript/no-explicit-any
    objectRecordsAggregatedValues?: Record<string, any>;
    selection: CommonSelection;
    take: number;
    totalCount: number | undefined;
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

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      this.flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    // oxlint-disable-next-line typescript/no-explicit-any
    const processedObjectRecord: Record<string, any> = {};

    for (const fieldId of flatObjectMetadata.fieldIds) {
      const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: fieldId,
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

      if (isMorphOrRelationFlatFieldMetadata(fieldMetadata)) {
        const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: fieldMetadata.name,
        });

        if (isDefined(objectRecord[joinColumnName])) {
          processedObjectRecord[joinColumnName] = objectRecord[joinColumnName];
        }
        continue;
      }

      const objectValue = objectRecord[fieldMetadata.name];

      if (!isDefined(objectValue)) {
        continue;
      }

      processedObjectRecord[fieldMetadata.name] = isCompositeFieldMetadataType(
        fieldMetadata.type,
      )
        ? this.processCompositeField(fieldMetadata, objectValue)
        : this.formatFieldValue(objectValue, fieldMetadata.type);
    }

    for (const { key, relationSelection } of getRelationSelectionEntries(
      selection,
    )) {
      const relationFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldIdByName[relationSelection.fieldName],
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

      if (
        !isDefined(relationFieldMetadata) ||
        !isMorphOrRelationFlatFieldMetadata(relationFieldMetadata)
      ) {
        continue;
      }

      const targetObjectMetadata = getTargetObjectMetadataOrThrow(
        relationFieldMetadata,
        this.flatObjectMetadataMaps,
      );

      const isToManyRelation =
        relationFieldMetadata.settings?.relationType ===
        RelationType.ONE_TO_MANY;
      const relationValue =
        isToManyRelation && !isDefined(objectRecord[key])
          ? []
          : objectRecord[key];

      if (Array.isArray(relationValue)) {
        processedObjectRecord[key] = this.createConnection({
          objectRecords: relationValue,
          parentObjectRecord: objectRecord,
          objectRecordsAggregatedValues: objectRecordsAggregatedValues[key],
          selection: relationSelection.selection,
          objectName: targetObjectMetadata.nameSingular,
          take,
          totalCount:
            objectRecordsAggregatedValues[key]?.[objectRecord.id]?.totalCount ??
            relationValue.length,
          order,
          hasNextPage: false,
          hasPreviousPage: false,
          depth: depth + 1,
        });
      } else if (isPlainObject(relationValue)) {
        processedObjectRecord[key] = this.processRecord({
          objectRecord: relationValue,
          objectRecordsAggregatedValues: objectRecordsAggregatedValues[key],
          selection: relationSelection.selection,
          objectName: targetObjectMetadata.nameSingular,
          take,
          totalCount,
          order,
          depth: depth + 1,
        });
      }
    }

    return processedObjectRecord as T;
  }

  private processCompositeField(
    fieldMetadata: OrmFlatFieldMetadata,
    // oxlint-disable-next-line typescript/no-explicit-any
    fieldValue: any,
    // oxlint-disable-next-line typescript/no-explicit-any
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
        if (subFieldKey === '__typename') {
          return acc;
        }

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
      // oxlint-disable-next-line typescript/no-explicit-any
      {} as Record<string, any>,
    );
  }

  // oxlint-disable-next-line typescript/no-explicit-any
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
