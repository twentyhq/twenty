import { type Router } from 'express';

export enum ExceptionHandlerDriver {
  SENTRY = 'SENTRY',
  CONSOLE = 'CONSOLE',
}

export interface ExceptionHandlerSentryDriverFactoryOptions {
  type: ExceptionHandlerDriver.SENTRY;
  options: {
    environment?: string;
    release?: string;
    dsn: string;
    serverInstance?: Router;
    debug?: boolean;
  };
}

export interface ExceptionHandlerDriverFactoryOptions {
  type: ExceptionHandlerDriver.CONSOLE;
}

export type ExceptionHandlerModuleOptions =
  | ExceptionHandlerSentryDriverFactoryOptions
  | ExceptionHandlerDriverFactoryOptions;
