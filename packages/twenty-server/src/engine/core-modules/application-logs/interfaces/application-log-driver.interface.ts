import { type ApplicationLogEntry } from 'src/engine/core-modules/application-logs/interfaces/application-log-entry.interface';

export interface ApplicationLogDriverInterface {
  writeLogs(entries: ApplicationLogEntry[]): Promise<void>;
}
