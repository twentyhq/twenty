import { Logger } from '@nestjs/common';

import { type ApplicationLogDriverInterface } from 'src/engine/core-modules/application-logs/interfaces/application-log-driver.interface';
import { type ApplicationLogEntry } from 'src/engine/core-modules/application-logs/interfaces/application-log-entry.interface';

export class ConsoleApplicationLogDriver
  implements ApplicationLogDriverInterface
{
  private readonly logger = new Logger(ConsoleApplicationLogDriver.name);

  async writeLogs(entries: ApplicationLogEntry[]): Promise<void> {
    for (const entry of entries) {
      const context = `${entry.logicFunctionName}:${entry.executionId}`;

      switch (entry.level) {
        case 'ERROR':
          this.logger.error(entry.message, undefined, context);
          break;
        case 'WARN':
          this.logger.warn(entry.message, context);
          break;
        case 'DEBUG':
          this.logger.debug(entry.message, context);
          break;
        default:
          this.logger.log(entry.message, context);
          break;
      }
    }
  }
}
