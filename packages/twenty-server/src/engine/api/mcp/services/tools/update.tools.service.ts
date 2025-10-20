import { Injectable } from '@nestjs/common';

import { type Request } from 'express';
import omit from 'lodash.omit';
import { isDefined } from 'twenty-shared/utils';

import { MCPMetadataToolsService } from 'src/engine/api/mcp/services/tools/mcp-metadata-tools.service';
import { validationSchemaManager } from 'src/engine/api/mcp/utils/get-json-schema';
import { MetadataQueryBuilderFactory } from 'src/engine/api/rest/metadata/query-builder/metadata-query-builder.factory';
import { type ObjectName } from 'src/engine/api/rest/metadata/types/metadata-entity.type';

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
            required: ['id'],
            properties: {
              ...omit(
                validationSchemaManager.getSchemas().UpdateOneFieldMetadataInput
                  .properties,
                ['update'],
              ),
              ...omit(
                validationSchemaManager.getSchemas().FieldMetadataDTO
                  .properties,
                [
                  'id',
                  'type',
                  'createdAt',
                  'updatedAt',
                  'isCustom',
                  'standardOverrides',
                ],
              ),
            },
          }),
        execute: (request: Request) => this.execute(request, 'fields'),
      },
      {
        name: 'update-object-metadata',
        description: 'Update an object metadata',
        inputSchema:
          this.mCPMetadataToolsService.mergeSchemaWithCommonProperties({
            ...validationSchemaManager.getSchemas().UpdateOneObjectInput,
            required: ['id'],
            properties: {
              ...omit(
                validationSchemaManager.getSchemas().UpdateOneObjectInput
                  .properties,
                ['update'],
              ),
              ...validationSchemaManager.getSchemas().UpdateObjectPayload
                .properties,
            },
          }),
        execute: (request: Request) => this.execute(request, 'objects'),
      },
    ];
  }

  async execute(request: Request, objectName: ObjectName) {
    const { id, fields, objects, ...body } = request.body.params.arguments;
    const selectors = {
      ...(isDefined(fields) ? { fields } : {}),
      ...(isDefined(objects) ? { objects } : {}),
    };

    const requestContext = {
      body,
      baseUrl: this.mCPMetadataToolsService.generateBaseUrl(request),
      path: `/rest/metadata/${objectName}/${id}`,
      headers: request.headers,
    };

    const response = await this.mCPMetadataToolsService.send(
      requestContext,
      await this.metadataQueryBuilderFactory.update(requestContext, selectors),
    );

    return response.data.data;
  }
}
