import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { MetadataQueryBuilderFactory } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.factory';
import { MCPMetadataToolsService } from 'src/engine/api/mcp/services/tools/mcp-metadata-tools.service';
import { validationSchemaManager } from 'src/engine/api/mcp/utils/get-json-schema';
import { ObjectName } from 'src/engine/api/rest/metadata/types/metadata-entity.type';

@Injectable()
export class DeleteToolsService {
  constructor(
    private readonly metadataQueryBuilderFactory: MetadataQueryBuilderFactory,
    private readonly mCPMetadataToolsService: MCPMetadataToolsService,
  ) {}

  get tools() {
    return [
      {
        name: 'delete-field-metadata',
        description: 'Delete a field metadata',
        inputSchema:
          this.mCPMetadataToolsService.mergeSchemaWithCommonProperties(
            validationSchemaManager.getSchemas().DeleteOneFieldInput,
          ),
        execute: (request: Request) => this.execute(request, 'fields'),
      },
      {
        name: 'delete-object-metadata',
        description: 'Delete an object metadata',
        inputSchema:
          this.mCPMetadataToolsService.mergeSchemaWithCommonProperties(
            validationSchemaManager.getSchemas().DeleteOneObjectInput,
          ),
        execute: (request: Request) => this.execute(request, 'objects'),
      },
    ];
  }

  async execute(request: Request, objectName: ObjectName) {
    const requestContext = {
      body: request.body.params.arguments,
      baseUrl: this.mCPMetadataToolsService.generateBaseUrl(request),
      path: `/rest/metadata/${objectName}/${request.body.params.arguments.id}`,
      headers: request.headers,
    };

    const response = await this.mCPMetadataToolsService.send(
      requestContext,
      await this.metadataQueryBuilderFactory.delete(requestContext),
    );

    return response.data.data;
  }
}
