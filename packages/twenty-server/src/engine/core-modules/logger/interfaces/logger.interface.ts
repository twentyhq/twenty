import { type LogLevel } from '@nestjs/common';

export type TwentyLogLevel = LogLevel | 'performance';

export enum LoggerDriverType {
  CONSOLE = 'CONSOLE',
}

export interface ConsoleDriverFactoryOptions {
  type: LoggerDriverType.CONSOLE;
  logLevels?: TwentyLogLevel[];
}

export type LoggerModuleOptions = ConsoleDriverFactoryOptions;
