import { Injectable, Logger } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

export type ExternalEventInput = {
  type: string;
  payload: Record<string, any>;
};

@Injectable()
export class ExternalEventService {
  private readonly logger = new Logger(ExternalEventService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly clickHouseService: ClickHouseService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  generateAuthKey(workspaceId: string): string {
    return this.jwtWrapperService.generateAppSecret(
      'EXTERNAL_EVENT',
      workspaceId,
    );
  }

  async createExternalEvent(
    workspaceId: string,
    externalEvent: ExternalEventInput,
  ): Promise<{ success: boolean }> {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      this.logger.log(
        'ClickHouse URL not configured, skipping external event logging',
      );

      return { success: true };
    }

    try {
      const event = {
        ...externalEvent,
        workspaceId,
        createdAt: new Date().toISOString(),
      };

      return await this.clickHouseService.insert('externalEvent', [event]);
    } catch (err) {
      this.logger.error('Error creating external event', err);

      return { success: false };
    }
  }
}
