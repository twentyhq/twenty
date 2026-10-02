import {
  compositeTypeDefinitions,
  FieldMetadataType,
  type ObjectRecord,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CONNECTION_MAX_DEPTH } from 'src/engine/api/graphql/graphql-query-runner/constants/connection-max-depth.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import {
  encodeCursorFromOrderByLeaves,
  resolveCursorOrderByLeaves,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { type OrderByValuesByRecordId } from 'src/engine/api/utils/build-order-by-values-by-record-id.util';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ConnectionFieldPlan =
  | {
      kind: 'composite';
      fieldMetadata: OrmFlatFieldMetadata;
      subFieldTypeByName: ReadonlyMap<string, FieldMetadataType> | undefined;
    }
  | {
      kind: 'relation';
      fieldMetadata: OrmFlatFieldMetadata;
      joinColumnName: string;
      isToManyRelation: boolean;
      targetObjectNameSingular: string;
    }
  | { kind: 'scalar'; fieldMetadata: OrmFlatFieldMetadata };

// TODO: Refacto-common - Rename CommonRecordsToGraphqlConnectionHelper
export class ObjectRecordsToGraphqlConnectionHelper {
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  private objectIdByNameSingular: Record<string, string>;
  private fieldPlansByObjectName = new Map<string, ConnectionFieldPlan[]>();

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
    objectRecordsAggregatedValues,
    selectedAggregatedFields,
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
    // oxlint-disable-next-line typescript/no-explicit-any
    selectedAggregatedFields?: Record<string, any>;
    objectName: string;
    take: number;
    totalCount: number | undefined;
    order?: ObjectRecordOrderBy;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    depth?: number;
    orderByValuesByRecordId?: OrderByValuesByRecordId;
  }): IConnection<T> {
    const edges = this.buildEdges({
      objectRecords: objectRecords ?? [],
      objectName,
      objectRecordsAggregatedValues,
      selectedAggregatedFields,
      take,
      totalCount,
      order,
      depth,
      orderByValuesByRecordId,
    });

    const connection = this.extractAggregatedFieldsValues({
      selectedAggregatedFields,
      objectRecordsAggregatedValues: parentObjectRecord
        ? objectRecordsAggregatedValues?.[parentObjectRecord.id]
        : objectRecordsAggregatedValues,
    });

    connection.edges = edges;
    connection.pageInfo = {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
    };
    connection.totalCount = totalCount;

    return connection as IConnection<T>;
  }

  private buildEdges<T extends ObjectRecord>({
    objectRecords,
    objectName,
    objectRecordsAggregatedValues,
    selectedAggregatedFields,
    take,
    totalCount,
    order,
    depth,
    orderByValuesByRecordId,
  }: {
    objectRecords: T[];
    objectName: string;
    // oxlint-disable-next-line typescript/no-explicit-any
    objectRecordsAggregatedValues?: Record<string, any>;
    // oxlint-disable-next-line typescript/no-explicit-any
    selectedAggregatedFields?: Record<string, any>;
    take: number;
    totalCount: number | undefined;
    order?: ObjectRecordOrderBy;
    depth: number;
    orderByValuesByRecordId?: OrderByValuesByRecordId;
  }): IConnection<T>['edges'] {
    if (objectRecords.length === 0) {
      return [];
    }

    const objectMetadataId = this.objectIdByNameSingular[objectName];
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: this.flatObjectMetadataMaps,
    });

    const cursorOrderByLeaves = resolveCursorOrderByLeaves({
      order,
      flatObjectMetadata,
      flatObjectMetadataMaps: this.flatObjectMetadataMaps,
      flatFieldMetadataMaps: this.flatFieldMetadataMaps,
    });

    return objectRecords.map((objectRecord) => ({
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
      cursor: encodeCursorFromOrderByLeaves({
        objectRecord,
        cursorOrderByLeaves,
        orderByValuesFromScan: orderByValuesByRecordId?.[objectRecord.id],
      }),
    }));
  }

  private extractAggregatedFieldsValues({
    selectedAggregatedFields,
    objectRecordsAggregatedValues,
  }: {
    selectedAggregatedFields: Record<string, AggregationField[]> | undefined;
    // oxlint-disable-next-line typescript/no-explicit-any
    objectRecordsAggregatedValues: Record<string, any> | undefined;
    // oxlint-disable-next-line typescript/no-explicit-any
  }): Record<string, any> {
    // oxlint-disable-next-line typescript/no-explicit-any
    const aggregatedFieldsValues: Record<string, any> = {};

    if (
      !isDefined(objectRecordsAggregatedValues) ||
      !isDefined(selectedAggregatedFields)
    ) {
      return aggregatedFieldsValues;
    }

    for (const aggregatedFieldName of Object.keys(selectedAggregatedFields)) {
      const aggregatedFieldValue =
        objectRecordsAggregatedValues[aggregatedFieldName];

      if (isDefined(aggregatedFieldValue)) {
        aggregatedFieldsValues[aggregatedFieldName] = aggregatedFieldValue;
      }
    }

    return aggregatedFieldsValues;
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  public processRecord<T extends Record<string, any>>({
    objectRecord,
    objectName,
    objectRecordsAggregatedValues,
    selectedAggregatedFields,
    take,
    totalCount,
    order,
    depth = 0,
  }: {
    objectRecord: T;
    objectName: string;
    // oxlint-disable-next-line typescript/no-explicit-any
    objectRecordsAggregatedValues?: Record<string, any>;
    // oxlint-disable-next-line typescript/no-explicit-any
    selectedAggregatedFields?: Record<string, any>;
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

    // oxlint-disable-next-line typescript/no-explicit-any
    const processedObjectRecord: Record<string, any> = {};

    for (const fieldPlan of this.getOrBuildFieldPlans(objectName)) {
      const { fieldMetadata } = fieldPlan;

      if (fieldPlan.kind === 'composite') {
        const objectValue = objectRecord[fieldMetadata.name];

        if (!isDefined(objectValue)) {
          continue;
        }
        processedObjectRecord[fieldMetadata.name] = this.processCompositeField(
          fieldMetadata,
          fieldPlan.subFieldTypeByName,
          objectValue,
        );
        continue;
      }

      if (fieldPlan.kind === 'relation') {
        const { joinColumnName } = fieldPlan;

        if (isDefined(objectRecord[joinColumnName])) {
          processedObjectRecord[joinColumnName] = objectRecord[joinColumnName];
        }

        const objectValue =
          !isDefined(objectRecord[fieldMetadata.name]) &&
          fieldPlan.isToManyRelation
            ? []
            : objectRecord[fieldMetadata.name];

        if (!isDefined(objectValue)) {
          continue;
        }

        const relationAggregatedValues =
          objectRecordsAggregatedValues?.[fieldMetadata.name];

        if (Array.isArray(objectValue)) {
          processedObjectRecord[fieldMetadata.name] = this.createConnection({
            objectRecords: objectValue,
            parentObjectRecord: objectRecord,
            objectRecordsAggregatedValues: relationAggregatedValues,
            selectedAggregatedFields:
              selectedAggregatedFields?.[fieldMetadata.name],
            objectName: fieldPlan.targetObjectNameSingular,
            take,
            totalCount:
              relationAggregatedValues?.totalCount ?? objectValue.length,
            order,
            hasNextPage: false,
            hasPreviousPage: false,
            depth: depth + 1,
          });
        } else if (isPlainObject(objectValue)) {
          processedObjectRecord[fieldMetadata.name] = this.processRecord({
            objectRecord: objectValue,
            objectRecordsAggregatedValues: relationAggregatedValues,
            selectedAggregatedFields:
              selectedAggregatedFields?.[fieldMetadata.name],
            objectName: fieldPlan.targetObjectNameSingular,
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

  private getOrBuildFieldPlans(objectName: string): ConnectionFieldPlan[] {
    const cachedFieldPlans = this.fieldPlansByObjectName.get(objectName);

    if (isDefined(cachedFieldPlans)) {
      return cachedFieldPlans;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: this.objectIdByNameSingular[objectName],
      flatEntityMaps: this.flatObjectMetadataMaps,
    });

    const fieldPlans: ConnectionFieldPlan[] = [];

    for (const fieldId of flatObjectMetadata.fieldIds) {
      const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: fieldId,
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeType = compositeTypeDefinitions.get(
          fieldMetadata.type as CompositeFieldMetadataType,
        );

        fieldPlans.push({
          kind: 'composite',
          fieldMetadata,
          subFieldTypeByName: isDefined(compositeType)
            ? new Map(
                compositeType.properties.map((property) => [
                  property.name,
                  property.type,
                ]),
              )
            : undefined,
        });
        continue;
      }

      if (isMorphOrRelationFlatFieldMetadata(fieldMetadata)) {
        const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
          flatEntityMaps: this.flatObjectMetadataMaps,
        });

        if (!isDefined(targetObjectMetadata)) {
          continue;
        }

        fieldPlans.push({
          kind: 'relation',
          fieldMetadata,
          joinColumnName: `${fieldMetadata.name}Id`,
          isToManyRelation:
            fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY,
          targetObjectNameSingular: targetObjectMetadata.nameSingular,
        });
        continue;
      }

      fieldPlans.push({ kind: 'scalar', fieldMetadata });
    }

    this.fieldPlansByObjectName.set(objectName, fieldPlans);

    return fieldPlans;
  }

  private processCompositeField(
    fieldMetadata: OrmFlatFieldMetadata,
    subFieldTypeByName: ReadonlyMap<string, FieldMetadataType> | undefined,
    // oxlint-disable-next-line typescript/no-explicit-any
    fieldValue: any,
    // oxlint-disable-next-line typescript/no-explicit-any
  ): Record<string, any> {
    if (!isDefined(subFieldTypeByName)) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    // oxlint-disable-next-line typescript/no-explicit-any
    const processedFieldValue: Record<string, any> = {};

    for (const subFieldKey of Object.keys(fieldValue)) {
      if (subFieldKey === '__typename') continue;

      const subFieldType = subFieldTypeByName.get(subFieldKey);

      if (!isDefined(subFieldType)) {
        throw new Error(
          `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
        );
      }

      processedFieldValue[subFieldKey] = this.formatFieldValue(
        fieldValue[subFieldKey],
        subFieldType,
      );
    }

    return processedFieldValue;
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
