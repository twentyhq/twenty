import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import pick from 'lodash.pick';

import { MetadataQueryBuilderFactory } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.factory';
import { MCPMetadataToolsService } from 'src/engine/api/mcp/services/tools/mcp-metadata-tools.service';
import { ObjectName } from 'src/engine/api/rest/metadata/types/metadata-entity.type';

@Injectable()
export class GetToolsService {
  constructor(
    private readonly metadataQueryBuilderFactory: MetadataQueryBuilderFactory,
    private readonly mCPMetadataToolsService: MCPMetadataToolsService,
  ) {}

  get tools() {
    const validationSchema =
      this.mCPMetadataToolsService.mergeSchemaWithCommonProperties({
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the resource, in UUID format.',
          },
          limit: {
            type: 'integer',
            minimum: 0,
            default: 100,
            description:
              'The maximum number of items to return in the response',
          },
          starting_after: {
            type: 'string',
            description:
              'A cursor for paginating results. Provide the starting_after value returned by the previous request to fetch subsequent items.',
          },
          ending_before: {
            type: 'string',
            description:
              'A cursor for paginating results. Provide the ending_before value returned by the previous request to fetch subsequent items.',
          },
        },
        dependencies: {
          starting_after: {
            not: {
              required: ['ending_before'],
            },
          },
          ending_before: {
            not: {
              required: ['starting_after'],
            },
          },
        },
        additionalProperties: false,
      });

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
      path: `/rest/metadata/${objectName}${request.body.params.arguments.id ? `/${request.body.params.arguments.id}` : ''}`,
      query: request.body.params.arguments,
      headers: request.headers,
    };

    const response = await this.mCPMetadataToolsService.send(
      requestContext,
      await this.metadataQueryBuilderFactory.get(
        requestContext,
        pick(request.body.params.arguments, ['fields', 'objects']),
      ),
    );

    return response.data.data;
  }
}
