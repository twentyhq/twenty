import { Injectable, LoggerService } from '@nestjs/common';

import { Record as ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';
import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { ActivityQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/activity-query-result-getter.handler';
import { AttachmentQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/attachment-query-result-getter.handler';
import { PersonQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/person-query-result-getter.handler';
import { WorkspaceMemberQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/workspace-member-query-result-getter.handler';
import { isQueryResultFieldValueAConnection } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/utils/is-query-result-field-value-a-connection.guard';
import { isQueryResultFieldValueANestedRecordArray } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/utils/is-query-result-field-value-a-nested-record-array.guard';
import { isQueryResultFieldValueARecordArray } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/utils/is-query-result-field-value-a-record-array.guard';
import { isQueryResultFieldValueARecord } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/utils/is-query-result-field-value-a-record.guard';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { ObjectMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { isDefined } from 'src/utils/is-defined';

// TODO: find a way to prevent conflict between handlers executing logic on object relations
// And this factory that is also executing logic on object relations
// Right now the factory will override any change made on relations by the handlers
@Injectable()
export class QueryResultGettersFactory {
  private handlers: Map<string, QueryResultGetterHandlerInterface>;

  constructor(
    private readonly fileService: FileService,
    private readonly loggerService: LoggerService,
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
      ['note', new ActivityQueryResultGetterHandler(this.fileService)],
      ['task', new ActivityQueryResultGetterHandler(this.fileService)],
    ]);
  }

  private async processConnection(
    connection: IConnection<ObjectRecord>,
    objectMetadataItemId: string,
    objectMetadataMap: ObjectMetadataMap,
    workspaceId: string,
  ): Promise<IConnection<ObjectRecord>> {
    return {
      ...connection,
      edges: await Promise.all(
        connection.edges.map(async (edge: IEdge<ObjectRecord>) => ({
          ...edge,
          node: await this.processRecord(
            edge.node,
            objectMetadataItemId,
            objectMetadataMap,
            workspaceId,
          ),
        })),
      ),
    };
  }

  private async processNestedRecordArray(
    result: { records: ObjectRecord[] },
    objectMetadataItemId: string,
    objectMetadataMap: ObjectMetadataMap,
    workspaceId: string,
  ) {
    return {
      ...result,
      records: await Promise.all(
        result.records.map(
          async (record: ObjectRecord) =>
            await this.processRecord(
              record,
              objectMetadataItemId,
              objectMetadataMap,
              workspaceId,
            ),
        ),
      ),
    };
  }

  private async processRecordArray(
    recordArray: ObjectRecord[],
    objectMetadataItemId: string,
    objectMetadataMap: ObjectMetadataMap,
    workspaceId: string,
  ) {
    return await Promise.all(
      recordArray.map(
        async (record: ObjectRecord) =>
          await this.processRecord(
            record,
            objectMetadataItemId,
            objectMetadataMap,
            workspaceId,
          ),
      ),
    );
  }

  private async processRecord(
    record: ObjectRecord,
    objectMetadataItemId: string,
    objectMetadataMap: ObjectMetadataMap,
    workspaceId: string,
  ): Promise<ObjectRecord> {
    const objectMetadataMapItem = objectMetadataMap[objectMetadataItemId];

    const handler = this.getHandler(objectMetadataMapItem.nameSingular);

    const relationFields = Object.keys(record)
      .map((recordFieldName) => objectMetadataMapItem.fields[recordFieldName])
      .filter(isDefined)
      .filter((fieldMetadata) =>
        isRelationFieldMetadataType(fieldMetadata.type),
      );

    const relationFieldsProcessedMap = {} as Record<
      string,
      QueryResultFieldValue
    >;

    for (const relationField of relationFields) {
      const relationMetadata =
        relationField.fromRelationMetadata ?? relationField.toRelationMetadata;

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
        objectMetadataMap[relationObjectMetadataItemId];

      if (!isDefined(relationObjectMetadataItem)) {
        throw new Error(
          `Object metadata not found for id ${relationObjectMetadataItemId}`,
        );
      }

      relationFieldsProcessedMap[relationField.name] =
        await this.processQueryResultField(
          record[relationField.name],
          relationObjectMetadataItem.id,
          objectMetadataMap,
          workspaceId,
        );
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
    objectMetadataMap: ObjectMetadataMap,
    workspaceId: string,
  ) {
    if (isQueryResultFieldValueAConnection(queryResultField)) {
      return await this.processConnection(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMap,
        workspaceId,
      );
    } else if (isQueryResultFieldValueANestedRecordArray(queryResultField)) {
      return await this.processNestedRecordArray(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMap,
        workspaceId,
      );
    } else if (isQueryResultFieldValueARecordArray(queryResultField)) {
      return await this.processRecordArray(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMap,
        workspaceId,
      );
    } else if (isQueryResultFieldValueARecord(queryResultField)) {
      return await this.processRecord(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMap,
        workspaceId,
      );
    } else {
      this.loggerService.warn(
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
    objectMetadataMap: ObjectMetadataMap,
  ): Promise<any> {
    return await this.processQueryResultField(
      result,
      objectMetadataItem.id,
      objectMetadataMap,
      workspaceId,
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
