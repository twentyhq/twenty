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
          $ref: '#/result/commonProperties/fields',
        },
        objects: {
          $ref: '#/result/commonProperties/objects',
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
