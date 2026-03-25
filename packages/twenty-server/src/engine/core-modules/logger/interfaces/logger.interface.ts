import { type LogLevel } from '@nestjs/common';

export enum LoggerDriverType {
  CONSOLE = 'CONSOLE',
}

export interface ConsoleDriverFactoryOptions {
  type: LoggerDriverType.CONSOLE;
  logLevels?: LogLevel[];
}

export type LoggerModuleOptions = ConsoleDriverFactoryOptions;
