import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import pick from 'lodash.pick';

import { MetadataQueryBuilderFactory } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.factory';
import { MCPMetadataToolsService } from 'src/engine/api/mcp/services/tools/mcp-metadata-tools.service';
import { validationSchemaManager } from 'src/engine/api/mcp/utils/get-json-schema';
import { ObjectName } from 'src/engine/api/rest/metadata/types/metadata-entity.type';

@Injectable()
export class CreateToolsService {
  constructor(
    private readonly metadataQueryBuilderFactory: MetadataQueryBuilderFactory,
    private readonly mCPMetadataToolsService: MCPMetadataToolsService,
  ) {}

  get tools() {
    return [
      {
        name: 'create-field-metadata',
        description: 'Create a new field metadata',
        inputSchema:
          this.mCPMetadataToolsService.mergeSchemaWithCommonProperties(
            validationSchemaManager.getSchemas().CreateFieldInput,
          ),
        execute: (request: Request) => this.execute(request, 'fields'),
      },
      {
        name: 'create-object-metadata',
        description: 'Create a new object metadata',
        inputSchema:
          this.mCPMetadataToolsService.mergeSchemaWithCommonProperties(
            validationSchemaManager.getSchemas().CreateObjectInput,
          ),
        execute: (request: Request) => this.execute(request, 'objects'),
      },
    ];
  }

  async execute(request: Request, objectName: ObjectName) {
    const requestContext = {
      body: request.body.params.arguments,
      baseUrl: this.mCPMetadataToolsService.generateBaseUrl(request),
      path: `/rest/metadata/${objectName}`,
      headers: request.headers,
    };
    const response = await this.mCPMetadataToolsService.send(
      requestContext,
      await this.metadataQueryBuilderFactory.create(
        requestContext,
        pick(request.body.params.arguments, ['fields', 'objects']),
      ),
    );

    return response.data.data;
  }
}
