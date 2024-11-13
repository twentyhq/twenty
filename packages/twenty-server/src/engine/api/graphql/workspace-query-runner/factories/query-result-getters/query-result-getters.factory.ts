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
  isPossibleFieldValueARecordArray,
} from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/utils/isResultAConnection';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { LogExecutionTime } from 'src/engine/decorators/observability/log-execution-time.decorator';
import { ObjectMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

export type PossibleFieldValue =
  | IConnection<ObjectRecord>
  | { records: ObjectRecord[] }
  | ObjectRecord;

// TODO: find a way to prevent conflict between handlers executing logic on object relations
// And this factory that is also executing logic on object relations
// Right now the factory will override any change made on relations by the handlers
@Injectable()
export class QueryResultGettersFactory {
  private handlers: Map<string, QueryResultGetterHandlerInterface>;

  constructor(
    private readonly fileService: FileService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
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

  async processRecordArray(
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
      .filter((fieldMetadata) =>
        isRelationFieldMetadataType(fieldMetadata.type),
      );

    // console.log({
    //   relationFields,
    // });

    // const relationFieldsProcessedMap = relationFields.reduce<
    //   Record<string, PossibleFieldValue>
    // >((relationFieldMap, fieldMetadata) => {
    //   const relationMetadata =
    //     fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

    //   if (!isDefined(relationMetadata)) {
    //     throw new Error('Relation metadata is not defined');
    //   }

    //   // TODO: computing this by taking the opposite of the current object metadata id
    //   // is really less than ideal. This should be computed based on the relation metadata
    //   // But right now it is too complex with the current structure and / or lack of utils
    //   // around the possible combinations with relation metadata from / to + MANY_TO_ONE / ONE_TO_MANY
    //   const relationObjectMetadataItemId =
    //     relationMetadata.fromObjectMetadataId === objectMetadataItemId
    //       ? relationMetadata.toObjectMetadataId
    //       : relationMetadata.fromObjectMetadataId;

    //   const relationObjectMetadataItem =
    //     objectMetadataMap[relationObjectMetadataItemId];

    //   if (!isDefined(relationObjectMetadataItem)) {
    //     throw new Error(
    //       `Object metadata not found for id ${relationObjectMetadataItemId}`,
    //     );
    //   }

    //   relationFieldMap[fieldMetadata.name] = this.processRecord(
    //     record[fieldMetadata.name],
    //     relationObjectMetadataItem.id,
    //     objectMetadataMap,
    //     workspaceId,
    //   );

    //   return relationFieldMap;
    // }, {});

    const objectRecordProcessedWithoutRelationFields = await handler.handle(
      record,
      workspaceId,
    );

    const newRecord = {
      ...objectRecordProcessedWithoutRelationFields,
      // ...relationFieldsProcessedMap,
    };

    return newRecord;
  }

  @LogExecutionTime('QueryResultGettersFactory.create')
  async create(
    result: PossibleFieldValue,
    objectMetadataItem: ObjectMetadataInterface,
    workspaceId: string,
  ): Promise<any> {
    const objectMetadataMap =
      await this.workspaceMetadataCacheService.getWorkspaceObjectMetadataMap(
        workspaceId,
      );

    // console.log(
    //   'QueryResultGettersFactory.create',
    //   objectMetadataItem.nameSingular,
    //   result,
    // );

    if (isPossibleFieldValueAConnection(result)) {
      return await this.processConnection(
        result,
        objectMetadataItem.id,
        objectMetadataMap,
        workspaceId,
      );
    } else if (isPossibleFieldValueARecordArray(result)) {
      return await this.processRecordArray(
        result,
        objectMetadataItem.id,
        objectMetadataMap,
        workspaceId,
      );
    } else {
      return await this.processRecord(
        result,
        objectMetadataItem.id,
        objectMetadataMap,
        workspaceId,
      );
    }
  }

  private getHandler(objectType: string): QueryResultGetterHandlerInterface {
    return (
      this.handlers.get(objectType) || {
        handle: (result: any) => result,
      }
    );
  }
}
