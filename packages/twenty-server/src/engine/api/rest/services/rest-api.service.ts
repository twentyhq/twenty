import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { Request } from 'express';
import { AxiosResponse } from 'axios';

import { ApiRestQuery } from 'src/engine/api/rest/types/query.type';
import { getServerUrl } from 'src/utils/get-server-url';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

export enum GraphqlApiType {
  CORE = 'core',
  METADATA = 'metadata',
}

@Injectable()
export class RestApiService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
  ) {}

  async call(
    graphqlApiType: GraphqlApiType,
    request: Request,
    data: ApiRestQuery,
  ) {
    const baseUrl = getServerUrl(
      request,
      this.environmentService.get('SERVER_URL'),
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
      throw new BadRequestException(err.response.data);
    }

    if (response.data.errors?.length) {
      throw new BadRequestException(response.data);
    }

    return response;
  }
}
