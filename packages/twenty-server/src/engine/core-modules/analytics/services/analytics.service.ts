import { Injectable } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ClickhouseService } from 'src/engine/core-modules/analytics/services/clickhouse.service';

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
    console.log('>>>>>>>>>>>>>> EVENT');
    if (!this.environmentService.get('ANALYTICS_ENABLED')) {
      return { success: true };
    }

    console.trace('>>>>>>>>>>>>>> userId:', userId);
    console.log('>>>>>>>>>>>>>> createEventInput:', createEventInput);
    switch (createEventInput.action) {
      case 'pageview':
        await this.clickhouseService.insert({
          timestamp: new Date().toISOString(),
          version: '1',
          userId: userId,
          workspaceId: workspaceId,
          ...createEventInput.payload,
        });
        break;
      default:
        await this.clickhouseService.insert({
          action: createEventInput.action,
          timestamp: new Date().toISOString(),
          version: '1',
          userId: userId,
          workspaceId: workspaceId,
          payload: JSON.stringify(createEventInput.payload),
        });
        break;
    }
  }
}
