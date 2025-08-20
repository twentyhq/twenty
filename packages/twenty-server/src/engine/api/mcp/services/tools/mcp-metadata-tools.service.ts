import { Injectable } from '@nestjs/common';

import { type Request } from 'express';
import { type JSONSchema7 } from 'json-schema';

import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';
import {
  RestApiService,
  GraphqlApiType,
} from 'src/engine/api/rest/rest-api.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getServerUrl } from 'src/utils/get-server-url';
import { type Query } from 'src/engine/api/rest/core/types/query.type';

@Injectable()
export class MCPMetadataToolsService {
  constructor(
    protected readonly restApiService: RestApiService,
    protected readonly twentyConfigService: TwentyConfigService,
  ) {}

  mergeSchemaWithCommonProperties(schema: JSONSchema7) {
    return {
      ...schema,
      properties: {
        ...schema.properties,
        fields: {
          type: 'array',
          items: {
            type: 'string',
            description:
              'Names of field properties to include in the response for field entities.',
            examples: [
              'type',
              'name',
              'label',
              'description',
              'icon',
              'isCustom',
              'isActive',
              'isSystem',
              'isNullable',
              'createdAt',
              'updatedAt',
              'defaultValue',
              'options',
              'relation',
            ],
          },
          description:
            'List of field names to select in the query for field entity. Strongly recommended to limit token usage and reduce response size. Use this to include only the properties you need.',
        },
        objects: {
          type: 'array',
          items: {
            type: 'string',
            description:
              'Object property names to include in the response for object entities.',
            examples: [
              'dataSourceId',
              'nameSingular',
              'namePlural',
              'labelSingular',
              'labelPlural',
              'description',
              'icon',
              'isCustom',
              'isActive',
              'isSystem',
              'createdAt',
              'updatedAt',
              'labelIdentifierFieldMetadataId',
              'imageIdentifierFieldMetadataId',
            ],
          },
          description:
            'List of object properties to select in the query for object entities. Strongly recommended to limit token usage and reduce response size. Specify only the necessary properties to optimize your request.',
        },
      },
    };
  }

  generateBaseUrl(request: Request) {
    return getServerUrl(
      this.twentyConfigService.get('SERVER_URL'),
      `${request.protocol}://${request.get('host')}`,
    );
  }

  async send(requestContext: RequestContext, data: Query) {
    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      requestContext,
      data,
    );
  }
}
