import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { type AxiosResponse } from 'axios';

import { type Query } from 'src/engine/api/rest/core/types/query.type';
import { RestApiException } from 'src/engine/api/rest/errors/RestApiException';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

export enum GraphqlApiType {
  CORE = 'core',
  METADATA = 'metadata',
}

@Injectable()
export class RestApiService {
  constructor(private readonly httpService: HttpService) {}

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

    try {
      response = await this.httpService.axiosRef.post(url, data, {
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
