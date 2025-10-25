import { type SyncableEntityOptions } from '@/types/syncable-entity-options.type';

type DatabaseEventTriggerOptions = SyncableEntityOptions & {
  eventName: string;
};

export const DatabaseEventTrigger = (
  _: DatabaseEventTriggerOptions,
): ClassDecorator => {
  return () => {};
};
