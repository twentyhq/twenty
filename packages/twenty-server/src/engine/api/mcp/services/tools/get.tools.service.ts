import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { MetadataQueryBuilderFactory } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.factory';
import { MCPMetadataToolsService } from 'src/engine/api/mcp/services/tools/mcp-metadata-tools.service';
import { ObjectName } from 'src/engine/api/rest/metadata/types/metadata-entity.type';
import { RequestContext } from 'src/engine/api/rest/types/RequestContext';

@Injectable()
export class GetToolsService {
  constructor(
    private readonly metadataQueryBuilderFactory: MetadataQueryBuilderFactory,
    private readonly mCPMetadataToolsService: MCPMetadataToolsService,
  ) {}

  get tools() {
    const validationSchema = {
      properties: { id: { format: 'uuid', type: 'string' } },
      type: 'object',
    };

    return [
      {
        name: 'get-field-metadata',
        description: 'Find fields metadata',
        inputSchema: validationSchema,
        execute: (request: Request) => this.execute(request, 'fields'),
      },
      {
        name: 'get-object-metadata',
        description: 'Find objects metadata',
        inputSchema: validationSchema,
        execute: (request: Request) => this.execute(request, 'objects'),
      },
    ];
  }

  async execute(request: Request, objectName: ObjectName) {
    const requestContext = {
      body: request.body.params.arguments,
      baseUrl: this.mCPMetadataToolsService.generateBaseUrl(request),
      path: `/rest/metadata/${objectName}`,
      query: request.query,
      headers: request.headers,
    };
    const response = await this.mCPMetadataToolsService.send(
      requestContext,
      await this.metadataQueryBuilderFactory.get(requestContext),
    );

    return response.data.data;
  }
}
