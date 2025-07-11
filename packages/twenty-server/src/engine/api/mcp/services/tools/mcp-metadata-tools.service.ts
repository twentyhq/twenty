import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { JSONSchema7 } from 'json-schema';

import { RequestContext } from 'src/engine/api/rest/types/RequestContext';
import {
  RestApiService,
  GraphqlApiType,
} from 'src/engine/api/rest/rest-api.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getServerUrl } from 'src/utils/get-server-url';
import { Query } from 'src/engine/api/rest/core/types/query.type';

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
            description: 'Name of the field to include in the response.',
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
          description: 'List of field names to select in the query.',
        },
        objects: {
          type: 'array',
          items: {
            type: 'string',
            description:
              'Name of the object property to include in the response.',
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
          description: 'List of object properties to select in the query.',
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
