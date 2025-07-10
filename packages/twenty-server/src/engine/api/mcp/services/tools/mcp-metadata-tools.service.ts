import { Injectable } from '@nestjs/common';

import { Request } from 'express';

import { RequestContext } from 'src/engine/api/rest/types/RequestContext';
import {
  RestApiService,
  GraphqlApiType,
} from 'src/engine/api/rest/rest-api.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getServerUrl } from 'src/utils/get-server-url';

@Injectable()
export class MCPMetadataToolsService {
  constructor(
    protected readonly restApiService: RestApiService,
    protected readonly twentyConfigService: TwentyConfigService,
  ) {}

  generateBaseUrl(request: Request) {
    return getServerUrl(
      this.twentyConfigService.get('SERVER_URL'),
      `${request.protocol}://${request.get('host')}`,
    );
  }

  async send(requestContext: RequestContext, data: any) {
    return await this.restApiService.call(
      GraphqlApiType.METADATA,
      requestContext,
      data,
    );
  }
}
