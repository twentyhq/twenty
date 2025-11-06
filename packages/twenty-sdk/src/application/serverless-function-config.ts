import { type SyncableEntityOptions } from '@/application/syncable-entity-options.type';

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

type ServerlessFunctionTrigger = SyncableEntityOptions &
  (RouteTrigger | CronTrigger | DatabaseEventTrigger);

export type ServerlessFunctionConfig = SyncableEntityOptions & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  triggers?: ServerlessFunctionTrigger[];
};
