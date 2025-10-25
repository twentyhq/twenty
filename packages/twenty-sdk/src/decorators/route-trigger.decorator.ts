import { type SyncableEntityOptions } from '@/types/syncable-entity-options.type';

type RouteTriggerOptions = SyncableEntityOptions & {
  path: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  isAuthRequired: boolean;
};

export const RouteTrigger = (_: RouteTriggerOptions): ClassDecorator => {
  return () => {};
};
