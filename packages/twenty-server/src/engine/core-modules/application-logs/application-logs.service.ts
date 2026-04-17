import { Inject, Injectable } from '@nestjs/common';

import { APPLICATION_LOG_DRIVER } from 'src/engine/core-modules/application-logs/application-logs.constants';
import { type ApplicationLogDriverInterface } from 'src/engine/core-modules/application-logs/interfaces/application-log-driver.interface';
import { type ApplicationLogEntry } from 'src/engine/core-modules/application-logs/interfaces/application-log-entry.interface';

@Injectable()
export class ApplicationLogsService {
  constructor(
    @Inject(APPLICATION_LOG_DRIVER)
    private driver: ApplicationLogDriverInterface,
  ) {}

  async writeLogs(entries: ApplicationLogEntry[]): Promise<void> {
    return this.driver.writeLogs(entries);
  }
}
