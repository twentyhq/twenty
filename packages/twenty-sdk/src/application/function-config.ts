import { type SyncableEntityOptions } from './syncable-entity-options.type';

type RouteTrigger = {
  type: 'route';
  path: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  isAuthRequired: boolean;
};

type CronTrigger = {
  type: 'cron';
  pattern: string;
};

type DatabaseEventTrigger = {
  type: 'databaseEvent';
  eventName: string;
};

type FunctionTrigger = SyncableEntityOptions &
  (RouteTrigger | CronTrigger | DatabaseEventTrigger);

export type FunctionConfig = SyncableEntityOptions & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  triggers?: FunctionTrigger[];
};
