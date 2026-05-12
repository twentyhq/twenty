import { type ApplicationLogDriver } from 'src/engine/core-modules/application-logs/interfaces/application-log-driver.enum';

export type ApplicationLogsModuleOptions = {
  type: ApplicationLogDriver;
};
