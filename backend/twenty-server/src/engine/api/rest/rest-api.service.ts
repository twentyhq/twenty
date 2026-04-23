import { Injectable } from '@nestjs/common';

import { type AxiosResponse } from 'axios';

import { type Query } from 'src/engine/api/rest/core/types/query.type';
import { RestApiException } from 'src/engine/api/rest/errors/RestApiException';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

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
      throw new RestApiException(err.response.data.errors);
    }

    if (response.data.errors?.length) {
      throw new RestApiException(response.data.errors);
    }

    return response;
  }
}
