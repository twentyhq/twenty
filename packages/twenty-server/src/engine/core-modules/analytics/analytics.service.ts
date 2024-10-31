import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { AxiosRequestConfig } from 'axios';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

import { TINYBIRD_ENDPOINTS_MAP } from './constants/tinybirdEndpoints.constants';

type CreateEventInput = {
  action: string;
  payload: object;
};

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly defaultDatasource = 'event';

  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
  ) {}

  async create(
    createEventInput: CreateEventInput,
    userId: string | null | undefined,
    workspaceId: string | null | undefined,
  ) {
    if (!this.environmentService.get('ANALYTICS_ENABLED')) {
      return { success: true };
    }

    let data;

    switch (createEventInput.action) {
      case 'pageview':
        data = {
          timestamp: new Date().toISOString(),
          version: '1',
          userId: userId,
          workspaceId: workspaceId,
          ...createEventInput.payload,
        };
        break;
      default:
        data = {
          action: createEventInput.action,
          timestamp: new Date().toISOString(),
          version: '1',
          userId: userId,
          workspaceId: workspaceId,
          payload: {
            ...createEventInput.payload,
          },
        };
        break;
    }

    const config: AxiosRequestConfig = {
      headers: {
        Authorization:
          'Bearer ' + this.environmentService.get('TINYBIRD_INGEST_TOKEN'),
      },
    };

    const datasource =
      createEventInput.action === 'pageview'
        ? 'pageview'
        : this.defaultDatasource;

    try {
      await this.httpService.axiosRef.post(
        `/events?name=${datasource}`,
        data,
        config,
      );
    } catch (error) {
      this.logger.error('Error occurred:', error);
      if (error.response) {
        this.logger.error(
          `Error response body: ${JSON.stringify(error.response.data)}`,
        );
      }

      return { success: false };
    }

    return { success: true };
  }

  generateWorkspaceJwt(workspaceId: string | undefined) {
    //put a verification if analytics is enabled
    if (!this.environmentService.get('ANALYTICS_ENABLED')) {
      return {};
    }
    const tinybirdJwtMap = Object.fromEntries(
      Object.entries(TINYBIRD_ENDPOINTS_MAP).map(
        ([endpointName, endpointUuid]) => [
          endpointName,
          this.jwtWrapperService.sign(
            {
              name: 'analytics_jwt',
              workspace_id: this.environmentService.get(
                'TINYBIRD_WORKSPACE_UUID',
              ),
              scopes: [
                {
                  type: 'PIPES:READ',
                  resource: endpointUuid,
                  fixed_params: { workspaceId: workspaceId },
                },
              ],
            },
            {
              secret: this.environmentService.get(
                'TINYBIRD_GENERATE_JWT_TOKEN',
              ),
              expiresIn: '7d',
            },
          ),
        ],
      ),
    );

    return tinybirdJwtMap;
  }
}
