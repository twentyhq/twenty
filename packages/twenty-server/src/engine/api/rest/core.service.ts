import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { Request } from 'express';
import { AxiosResponse } from 'axios';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core-query-builder/core-query-builder.factory';
import { ApiRestQuery } from 'src/engine/api/rest/types/query.type';
import { getServerUrl } from 'src/utils/get-server-url';

@Injectable()
export class CoreService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly apiRestQueryBuilderFactory: CoreQueryBuilderFactory,
    private readonly httpService: HttpService,
  ) {}

  async callGraphql(request: Request, data: ApiRestQuery) {
    const baseUrl = getServerUrl(
      request,
      this.environmentService.get('SERVER_URL'),
    );
    let response: AxiosResponse;

    try {
      response = await this.httpService.axiosRef.post(
        `${baseUrl}/graphql`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: request.headers.authorization,
          },
        },
      );
    } catch (err) {
      throw new BadRequestException(err.response.data);
    }

    if (response.data.errors?.length) {
      throw new BadRequestException(response.data);
    }

    return response;
  }

  async get(request: Request) {
    const data = await this.apiRestQueryBuilderFactory.get(request);

    return await this.callGraphql(request, data);
  }

  async delete(request: Request) {
    const data = await this.apiRestQueryBuilderFactory.delete(request);

    return await this.callGraphql(request, data);
  }

  async createOne(request: Request) {
    const data = await this.apiRestQueryBuilderFactory.createOne(request);

    return await this.callGraphql(request, data);
  }

  async createMany(request: Request) {
    const data = await this.apiRestQueryBuilderFactory.createMany(request);

    return await this.callGraphql(request, data);
  }

  async update(request: Request) {
    const data = await this.apiRestQueryBuilderFactory.update(request);

    return await this.callGraphql(request, data);
  }
}
