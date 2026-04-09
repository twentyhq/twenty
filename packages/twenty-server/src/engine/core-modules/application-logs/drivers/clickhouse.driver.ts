import { Logger } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { type ApplicationLogEntry } from 'src/engine/core-modules/application-logs/interfaces/application-log-entry.interface';
import { type ApplicationLogDriverInterface } from 'src/engine/core-modules/application-logs/interfaces/application-log-driver.interface';

export class ClickHouseApplicationLogDriver
  implements ApplicationLogDriverInterface
{
  private readonly logger = new Logger(ClickHouseApplicationLogDriver.name);

  constructor(private readonly clickHouseService: ClickHouseService) {}

  async writeLogs(entries: ApplicationLogEntry[]): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    const rows = entries.map((entry) => ({
      timestamp: formatDateForClickHouse(entry.timestamp),
      workspaceId: entry.workspaceId,
      applicationId: entry.applicationId,
      logicFunctionId: entry.logicFunctionId,
      logicFunctionName: entry.logicFunctionName,
      executionId: entry.executionId,
      level: entry.level,
      message: entry.message,
    }));

    const result = await this.clickHouseService.insert('applicationLog', rows);

    if (!result.success) {
      this.logger.error('Failed to insert application logs into ClickHouse');
    }
  }
}
