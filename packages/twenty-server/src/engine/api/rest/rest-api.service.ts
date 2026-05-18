import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { type AxiosResponse } from 'axios';

import { type Query } from 'src/engine/api/rest/core/types/query.type';
import { RestApiException } from 'src/engine/api/rest/errors/RestApiException';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { isDefined } from 'twenty-shared/utils';

export enum GraphqlApiType {
  CORE = 'core',
  METADATA = 'metadata',
}

@Injectable()
export class RestApiService {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async call(
    graphqlApiType: GraphqlApiType,
    requestContext: RequestContext,
    data: Query,
  ) {
    let response: AxiosResponse;
    const url = `${requestContext.baseUrl}/${
      graphqlApiType === GraphqlApiType.CORE
        ? 'graphql'
        : GraphqlApiType.METADATA
    }`;

    // Internal request to the server's own GraphQL endpoint
    const httpClient = this.secureHttpClientService.getInternalHttpClient();

    try {
      response = await httpClient.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: requestContext.headers.authorization,
        },
      });
    } catch (err) {
      if (isDefined(err.response?.data?.errors)) {
        throw new RestApiException(err.response.data.errors);
      }

      throw new InternalServerErrorException(
        err.message ?? 'Internal server error',
      );
    }

    if (isDefined(response.data.errors) && response.data.errors.length > 0) {
      throw new RestApiException(response.data.errors);
    }

    return response;
  }
}
