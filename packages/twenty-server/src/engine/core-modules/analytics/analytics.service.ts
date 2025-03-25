import { Injectable } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

type CreateEventInput = {
  action: string;
  payload: object;
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly environmentService: EnvironmentService) {}

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

    // TODO: send event to clickhouse

    return { success: true };
  }
}
