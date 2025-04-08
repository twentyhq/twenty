import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

type CreateEventInput = {
  action: string;
  payload: object;
};

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly httpService: HttpService,
  ) {}

  async create(
    createEventInput: CreateEventInput,
    userId: string | null | undefined,
    workspaceId: string | null | undefined,
  ) {
    if (!this.environmentService.get('TELEMETRY_ENABLED')) {
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

    try {
      await this.httpService.axiosRef.post(`/selfHostingEvent`, data);
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
