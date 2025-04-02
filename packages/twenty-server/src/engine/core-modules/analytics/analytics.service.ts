import { Injectable } from '@nestjs/common';

import { ClickhouseService } from 'src/database/clickhouse/clickhouse.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

type CreateEventInput = {
  action: string;
  payload: object;
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly clickhouseService: ClickhouseService,
  ) {}

  async create(
    createEventInput: CreateEventInput,
    userId: string | null | undefined,
    workspaceId: string | null | undefined,
  ) {
    if (!this.environmentService.get('ANALYTICS_ENABLED')) {
      return { success: true };
    }

    let _data;

    switch (createEventInput.action) {
      case 'pageview':
        _data = {
          timestamp: new Date().toISOString(),
          version: '1',
          userId: userId,
          workspaceId: workspaceId,
          ...createEventInput.payload,
        };
        break;
      default:
        _data = {
          action: createEventInput.action,
          timestamp: new Date().toISOString(),
          version: '1',
          userId: userId,
          workspaceId: workspaceId,
          payload: JSON.stringify(createEventInput.payload),
        };
        break;
    }

    try {
      if (createEventInput.action === 'pageview') {
        await this.clickhouseService.insert('pageview', [_data]);
      } else {
        await this.clickhouseService.insert('events', [_data]);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to send event to ClickHouse:', error);
      return { success: false };
    }
  }
}
