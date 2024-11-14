import { Injectable } from '@nestjs/common';

import { Record as ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { ActivityQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/activity-query-result-getter.handler';
import { AttachmentQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/attachment-query-result-getter.handler';
import { PersonQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/person-query-result-getter.handler';
import { WorkspaceMemberQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/workspace-member-query-result-getter.handler';
import {
  isPossibleFieldValueAConnection,
  isPossibleFieldValueANestedRecordArray,
  isPossibleFieldValueARecordArray,
} from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/utils/isResultAConnection';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { ObjectMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { isDefined } from 'src/utils/is-defined';

export type PossibleQueryResultFieldValue =
  | IConnection<ObjectRecord>
  | { records: ObjectRecord[] }
  | ObjectRecord
  | ObjectRecord[];

// TODO: find a way to prevent conflict between handlers executing logic on object relations
// And this factory that is also executing logic on object relations
// Right now the factory will override any change made on relations by the handlers
@Injectable()
export class QueryResultGettersFactory {
  private handlers: Map<string, QueryResultGetterHandlerInterface>;

  constructor(private readonly fileService: FileService) {
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

  async processConnection(
    connection: IConnection<ObjectRecord>,
    objectMetadataItemId: string,
    objectMetadataMap: ObjectMetadataMap,
    workspaceId: string,
  ): Promise<any> {
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

  async processNestedRecordArray(
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

  async processRecordArray(
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

  async processRecord(
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
      PossibleQueryResultFieldValue
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

    const newRecord = {
      ...objectRecordProcessedWithoutRelationFields,
      ...relationFieldsProcessedMap,
    };

    return newRecord;
  }

  async processQueryResultField(
    queryResultField: PossibleQueryResultFieldValue,
    objectMetadataItemId: string,
    objectMetadataMap: ObjectMetadataMap,
    workspaceId: string,
  ) {
    if (isPossibleFieldValueAConnection(queryResultField)) {
      return await this.processConnection(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMap,
        workspaceId,
      );
    } else if (isPossibleFieldValueANestedRecordArray(queryResultField)) {
      return await this.processNestedRecordArray(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMap,
        workspaceId,
      );
    } else if (isPossibleFieldValueARecordArray(queryResultField)) {
      return await this.processRecordArray(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMap,
        workspaceId,
      );
    } else {
      return await this.processRecord(
        queryResultField,
        objectMetadataItemId,
        objectMetadataMap,
        workspaceId,
      );
    }
  }

  @LogExecutionTime('QueryResultGettersFactory.create')
  async create(
    result: PossibleQueryResultFieldValue,
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
