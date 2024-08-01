import { Injectable } from '@nestjs/common';

import { QueryResultGuetterHandlerInterface } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-getter-handler.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { AttachmentQueryResultGetterHandler } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/handlers/attachment-query-result-getter.handler';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class QueryResultGettersFactory {
  private handlers: Map<string, QueryResultGuetterHandlerInterface>;

  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
  ) {
    this.initializeHandlers();
  }

  private initializeHandlers() {
    this.handlers = new Map<string, QueryResultGuetterHandlerInterface>([
      [
        'attachment',
        new AttachmentQueryResultGetterHandler(
          this.tokenService,
          this.environmentService,
        ),
      ],
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
            node: await handler.process(edge.node, workspaceId),
          })),
        ),
      };
    }

    if (result.records) {
      return {
        ...result,
        records: await Promise.all(
          result.records.map(
            async (item: any) => await handler.process(item, workspaceId),
          ),
        ),
      };
    }

    return await handler.process(result, workspaceId);
  }

  private getHandler(objectType: string): QueryResultGuetterHandlerInterface {
    return (
      this.handlers.get(objectType) || {
        process: (result: any) => result,
      }
    );
  }
}
