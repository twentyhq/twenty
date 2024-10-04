import { Injectable } from '@nestjs/common';

import { QueryResultGetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { ActivityQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/activity-query-result-getter.handler';
import { AttachmentQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/attachment-query-result-getter.handler';
import { PersonQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/person-query-result-getter.handler';
import { WorkspaceMemberQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/workspace-member-query-result-getter.handler';
import { FileService } from 'src/engine/core-modules/file/services/file.service';

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

  async create(
    result: any,
    objectMetadataItem: ObjectMetadataInterface,
    workspaceId: string,
  ): Promise<any> {
    const handler = this.getHandler(objectMetadataItem.nameSingular);

    if (result.edges) {
      return {
        ...result,
        edges: await Promise.all(
          result.edges.map(async (edge: any) => ({
            ...edge,
            node: await handler.handle(edge.node, workspaceId),
          })),
        ),
      };
    }

    if (result.records) {
      return {
        ...result,
        records: await Promise.all(
          result.records.map(
            async (item: any) => await handler.handle(item, workspaceId),
          ),
        ),
      };
    }

    return await handler.handle(result, workspaceId);
  }

  private getHandler(objectType: string): QueryResultGetterHandlerInterface {
    return (
      this.handlers.get(objectType) || {
        handle: (result: any) => result,
      }
    );
  }
}
