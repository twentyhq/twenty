import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { Request } from 'express';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { ApiRestQueryBuilderFactory } from 'src/engine/api/rest/api-rest-query-builder/api-rest-query-builder.factory';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { ApiRestResponse } from 'src/engine/api/rest/types/api-rest-response.type';
import { ApiRestQuery } from 'src/engine/api/rest/types/api-rest-query.type';
import { getServerUrl } from 'src/utils/get-server-url';

@Injectable()
export class ApiRestService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
    private readonly apiRestQueryBuilderFactory: ApiRestQueryBuilderFactory,
    private readonly httpService: HttpService,
  ) {}

  async callGraphql(
    request: Request,
    data: ApiRestQuery,
  ): Promise<ApiRestResponse> {
    const baseUrl = getServerUrl(
      request,
      this.environmentService.get('SERVER_URL'),
    );

    try {
      return await this.httpService.axiosRef.post(`${baseUrl}/graphql`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.authorization,
        },
      });
    } catch (err) {
      return {
        data: {
          error: `${err}. Please check your query.`,
          status: err.response.status,
        },
      };
    }
  }

  async get(request: Request): Promise<ApiRestResponse> {
    try {
      const data = await this.apiRestQueryBuilderFactory.get(request);

      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: err, status: err.status } };
    }
  }

  async delete(request: Request): Promise<ApiRestResponse> {
    try {
      const data = await this.apiRestQueryBuilderFactory.delete(request);

      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: err, status: err.status } };
    }
  }

  async create(request: Request): Promise<ApiRestResponse> {
    try {
      const data = await this.apiRestQueryBuilderFactory.create(request);

      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: err, status: err.status } };
    }
  }

  async update(request: Request): Promise<ApiRestResponse> {
    try {
      const data = await this.apiRestQueryBuilderFactory.update(request);

      return await this.callGraphql(request, data);
    } catch (err) {
      return { data: { error: err, status: err.status } };
    }
  }
}
