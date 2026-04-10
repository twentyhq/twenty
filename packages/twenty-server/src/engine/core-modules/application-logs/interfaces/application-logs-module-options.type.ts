import { type ApplicationLogDriverType } from 'src/engine/core-modules/application-logs/interfaces/application-log-driver-type.enum';

export type ApplicationLogsModuleOptions = {
  type: ApplicationLogDriverType;
};
