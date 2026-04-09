import { type ApplicationLogDriverInterface } from 'src/engine/core-modules/application-logs/interfaces/application-log-driver.interface';

export class DisabledApplicationLogDriver
  implements ApplicationLogDriverInterface
{
  async writeLogs(): Promise<void> {
    return;
  }
}
