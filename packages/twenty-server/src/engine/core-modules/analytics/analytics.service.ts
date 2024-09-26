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
  private readonly datasource = 'event';

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

    const data = {
      action: createEventInput.action,
      timestamp: new Date().toISOString(),
      version: '1',
      payload: {
        userId: userId,
        workspaceId: workspaceId,
        ...createEventInput.payload,
      },
    };

    const config: AxiosRequestConfig = {
      headers: {
        Authorization:
          'Bearer ' + this.environmentService.get('TINYBIRD_TOKEN'),
      },
    };

    try {
      await this.httpService.axiosRef.post(
        `/events?name=${this.datasource}`,
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
