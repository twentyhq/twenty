import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';
import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { isQueryResultFieldValueAConnection } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/guards/is-query-result-field-value-a-connection.guard';
import { isQueryResultFieldValueANestedRecordArray } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/guards/is-query-result-field-value-a-nested-record-array.guard';
import { isQueryResultFieldValueARecordArray } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/guards/is-query-result-field-value-a-record-array.guard';
import { isQueryResultFieldValueARecord } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/guards/is-query-result-field-value-a-record.guard';
import { ActivityQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/activity-query-result-getter.handler';
import { AttachmentQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/attachment-query-result-getter.handler';
import { PersonQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/person-query-result-getter.handler';
import { WorkspaceMemberQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/workspace-member-query-result-getter.handler';
import { CompositeInputTypeDefinitionFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-input-type-definition.factory';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

// TODO: find a way to prevent conflict between handlers executing logic on object relations
// And this factory that is also executing logic on object relations
// Right now the factory will override any change made on relations by the handlers
@Injectable()
export class QueryResultGettersFactory {
  private readonly logger = new Logger(
    CompositeInputTypeDefinitionFactory.name,
  );
  private handlers: Map<string, QueryResultGetterHandlerInterface>;

  constructor(
    private readonly fileService: FileService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    this.initializeHandlers();
  }

  private initializeHandlers() {
    this.handlers = new Map<string, QueryResultGetterHandlerInterface>([
      ['attachment', new AttachmentQueryResultGetterHandler(this.fileService)],
      ['person', new PersonQueryResultGetterHandler(this.fileService)],
      [
        'workspaceMember',
        new WorkspaceMemberQueryResultGetterHandler(this.fileService),
      ],
      [
        'note',
        new ActivityQueryResultGetterHandler(
          this.fileService,
          this.featureFlagService,
        ),
      ],
      [
        'task',
        new ActivityQueryResultGetterHandler(
          this.fileService,
          this.featureFlagService,
        ),
      ],
    ]);
  }

  private async processConnection(
    connection: IConnection<ObjectRecord>,
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
    isNewRelationEnabled: boolean,
  ): Promise<IConnection<ObjectRecord>> {
    return {
      ...connection,
      edges: await Promise.all(
        connection.edges.map(async (edge: IEdge<ObjectRecord>) => ({
          ...edge,
          node: await this.processRecord(
            edge.node,
            objectMetadataItemId,
            objectMetadataMaps,
            workspaceId,
            isNewRelationEnabled,
          ),
        })),
      ),
    };
  }

  private async processNestedRecordArray(
    result: { records: ObjectRecord[] },
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
    isNewRelationEnabled: boolean,
  ) {
    return {
      ...result,
      records: await Promise.all(
        result.records.map(
          async (record: ObjectRecord) =>
            await this.processRecord(
              record,
              objectMetadataItemId,
              objectMetadataMaps,
              workspaceId,
              isNewRelationEnabled,
            ),
        ),
      ),
    };
  }

  private async processRecordArray(
    recordArray: ObjectRecord[],
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
    isNewRelationEnabled: boolean,
  ) {
    return await Promise.all(
      recordArray.map(
        async (record: ObjectRecord) =>
          await this.processRecord(
            record,
            objectMetadataItemId,
            objectMetadataMaps,
            workspaceId,
            isNewRelationEnabled,
          ),
      ),
    );
  }

  private async processRecord(
    record: ObjectRecord,
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
    isNewRelationEnabled: boolean,
  ): Promise<ObjectRecord> {
    const objectMetadataMapItem = objectMetadataMaps.byId[objectMetadataItemId];

    const handler = this.getHandler(objectMetadataMapItem.nameSingular);

    const relationFields = Object.keys(record)
      .map(
        (recordFieldName) =>
          objectMetadataMapItem.fieldsByName[recordFieldName],
      )
      .filter(isDefined)
      .filter((fieldMetadata) =>
        isFieldMetadataInterfaceOfType(
          fieldMetadata,
          FieldMetadataType.RELATION,
        ),
      );

    const relationFieldsProcessedMap = {} as Record<
      string,
      QueryResultFieldValue
    >;

    for (const relationField of relationFields) {
      if (!isNewRelationEnabled) {
        const relationMetadata =
          relationField.fromRelationMetadata ??
          relationField.toRelationMetadata;

        if (!isDefined(relationMetadata)) {
          throw new Error('Relation metadata is not defined');
        }

        // TODO: computing this by taking the opposite of the current object metadata id
        // is really less than ideal. This should be computed based on the relation metadata
        // But right now it is too complex with the current structure and / or lack of utils
        // around the possible combinations with relation metadata from / to + MANY_TO_ONE / ONE_TO_MANY
        const relationObjectMetadataItemId =
          relationMetadata.fromObjectMetadataId === objectMetadataItemId
            ? relationMetadata.toObjectMetadataId
            : relationMetadata.fromObjectMetadataId;

        const relationObjectMetadataItem =
          objectMetadataMaps.byId[relationObjectMetadataItemId];

        if (!isDefined(relationObjectMetadataItem)) {
          throw new Error(
            `Object metadata not found for id ${relationObjectMetadataItemId}`,
          );
        }

        relationFieldsProcessedMap[relationField.name] =
          await this.processQueryResultField(
            record[relationField.name],
            relationObjectMetadataItem.id,
            objectMetadataMaps,
            workspaceId,
            isNewRelationEnabled,
          );
      } else {
        if (!isDefined(relationField.relationTargetObjectMetadataId)) {
          throw new Error('Relation target object metadata id is not defined');
        }

        relationFieldsProcessedMap[relationField.name] =
          await this.processQueryResultField(
            record[relationField.name],
            relationField.relationTargetObjectMetadataId,
            objectMetadataMaps,
            workspaceId,
            isNewRelationEnabled,
          );
      }
    }

    const objectRecordProcessedWithoutRelationFields = await handler.handle(
      record,
      workspaceId,
    );

    const processedRecord = {
      ...objectRecordProcessedWithoutRelationFields,
      ...relationFieldsProcessedMap,
    };

    return processedRecord;
  }

  private async processQueryResultField(
    queryResultField: QueryResultFieldValue,
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    workspaceId: string,
    isNewRelationEnabled: boolean,
  ) {
    if (isQueryResultFieldValueAConnection(queryResultField)) {
      return await this.processConnection(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMaps,
        workspaceId,
        isNewRelationEnabled,
      );
    } else if (isQueryResultFieldValueANestedRecordArray(queryResultField)) {
      return await this.processNestedRecordArray(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMaps,
        workspaceId,
        isNewRelationEnabled,
      );
    } else if (isQueryResultFieldValueARecordArray(queryResultField)) {
      return await this.processRecordArray(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMaps,
        workspaceId,
        isNewRelationEnabled,
      );
    } else if (isQueryResultFieldValueARecord(queryResultField)) {
      return await this.processRecord(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMaps,
        workspaceId,
        isNewRelationEnabled,
      );
    } else {
      this.logger.warn(
        `Query result field is not a record, connection, nested record array or record array. 
        This is an undetected case in query result getter that should be implemented !!`,
      );

      return queryResultField;
    }
  }

  async create(
    result: QueryResultFieldValue,
    objectMetadataItem: ObjectMetadataInterface,
    workspaceId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    isNewRelationEnabled: boolean,
  ): Promise<any> {
    return await this.processQueryResultField(
      result,
      objectMetadataItem.id,
      objectMetadataMaps,
      workspaceId,
      isNewRelationEnabled,
    );
  }

  private getHandler(objectType: string): QueryResultGetterHandlerInterface {
    return (
      this.handlers.get(objectType) || {
        handle: (result: any) => result,
      }
    );
  }
}
