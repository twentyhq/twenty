import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { AxiosResponse } from 'axios';
import { Request } from 'express';

import { Query } from 'src/engine/api/rest/core/types/query.type';
import { RestApiException } from 'src/engine/api/rest/errors/RestApiException';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getServerUrl } from 'src/utils/get-server-url';

export enum GraphqlApiType {
  CORE = 'core',
  METADATA = 'metadata',
}

@Injectable()
export class RestApiService {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly httpService: HttpService,
  ) {}

  async call(graphqlApiType: GraphqlApiType, request: Request, data: Query) {
    const baseUrl = getServerUrl(
      request,
      this.twentyConfigService.get('SERVER_URL'),
    );
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
