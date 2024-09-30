import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { AxiosRequestConfig } from 'axios';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

type CreateEventInput = {
  action: string;
  payload: object;
};

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly defaultDatasource = 'event';

  constructor(
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
          'Bearer ' + this.environmentService.get('TINYBIRD_TOKEN'),
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
}
