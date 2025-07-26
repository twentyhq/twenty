import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import omit from 'lodash.omit';
import pick from 'lodash.pick';

import { MetadataQueryBuilderFactory } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.factory';
import { MCPMetadataToolsService } from 'src/engine/api/mcp/services/tools/mcp-metadata-tools.service';
import { validationSchemaManager } from 'src/engine/api/mcp/utils/get-json-schema';
import { ObjectName } from 'src/engine/api/rest/metadata/types/metadata-entity.type';

@Injectable()
export class UpdateToolsService {
  constructor(
    private readonly metadataQueryBuilderFactory: MetadataQueryBuilderFactory,
    private readonly mCPMetadataToolsService: MCPMetadataToolsService,
  ) {}

  get tools() {
    return [
      {
        name: 'update-field-metadata',
        description: 'Update a field metadata',
        inputSchema:
          this.mCPMetadataToolsService.mergeSchemaWithCommonProperties({
            ...validationSchemaManager.getSchemas().UpdateOneFieldMetadataInput,
            properties: omit(
              validationSchemaManager.getSchemas().FieldMetadataDTO.properties,
              [
                'id',
                'type',
                'createdAt',
                'updatedAt',
                'isCustom',
                'standardOverrides',
              ],
            ),
          }),
        execute: (request: Request) => this.execute(request, 'fields'),
      },
      {
        name: 'update-object-metadata',
        description: 'Update an object metadata',
        inputSchema:
          this.mCPMetadataToolsService.mergeSchemaWithCommonProperties(
            validationSchemaManager.getSchemas().UpdateOneObjectInput,
          ),
        execute: (request: Request) => this.execute(request, 'objects'),
      },
    ];
  }

  async execute(request: Request, objectName: ObjectName) {
    const { id, ...body } = request.body.params.arguments;
    const requestContext = {
      body,
      baseUrl: this.mCPMetadataToolsService.generateBaseUrl(request),
      path: `/rest/metadata/${objectName}/${id}`,
      headers: request.headers,
    };

    const response = await this.mCPMetadataToolsService.send(
      requestContext,
      await this.metadataQueryBuilderFactory.update(
        requestContext,
        pick(request.body.params.arguments, ['fields', 'objects']),
      ),
    );

    return response.data.data;
  }
}
