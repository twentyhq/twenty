import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { Request } from 'express';
import { AxiosResponse } from 'axios';

import { Query } from 'src/engine/api/rest/core/types/query.type';
import { getServerUrl } from 'src/utils/get-server-url';
import { RestApiException } from 'src/engine/api/rest/errors/RestApiException';
import { ApiUrl } from 'src/engine/utils/serverAndApiUrl';

export enum GraphqlApiType {
  CORE = 'core',
  METADATA = 'metadata',
}

@Injectable()
export class RestApiService {
  constructor(private readonly httpService: HttpService) {}

  async call(graphqlApiType: GraphqlApiType, request: Request, data: Query) {
    const baseUrl = getServerUrl(request, ApiUrl.get());
    let response: AxiosResponse;
    const url = `${baseUrl}/${
      graphqlApiType === GraphqlApiType.CORE
        ? 'graphql'
        : GraphqlApiType.METADATA
    }`;

    try {
      response = await this.httpService.axiosRef.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.authorization,
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
