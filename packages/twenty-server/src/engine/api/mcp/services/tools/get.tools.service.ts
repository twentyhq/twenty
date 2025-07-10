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
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Unique identifier for the resource',
        },
        limit: {
          type: 'integer',
          minimum: 0,
          description: 'The maximum number of items to return in the response',
        },
        starting_after: {
          type: 'string',
          description:
            'A cursor for use in pagination. The starting_after parameter is an object ID that defines your place in the list.',
        },
        ending_before: {
          type: 'string',
          description:
            'A cursor for use in pagination. The ending_before parameter is an object ID that defines your place in the list.',
        },
        fields: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Name of the field to include in the response.',
          },
          description: 'List of field names to select in the query.',
        },
        objects: {
          type: 'array',
          items: {
            type: 'string',
            description:
              'Name of the object property to include in the response.',
          },
          description: 'List of object properties to select in the query.',
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
      path: `/rest/metadata/${objectName}${request.body.params.arguments.id ? `/${request.body.params.arguments.id}` : ''}`,
      query: request.body.params.arguments,
      headers: request.headers,
    };
    const response = await this.mCPMetadataToolsService.send(
      requestContext,
      await this.metadataQueryBuilderFactory.get(requestContext),
    );

    return response.data.data;
  }
}
