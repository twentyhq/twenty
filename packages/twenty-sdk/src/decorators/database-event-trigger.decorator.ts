import { type SyncableEntityOptions } from '@/decorators/types/syncable-entity-options.type';

type DatabaseEventTriggerOptions = SyncableEntityOptions & {
  eventName: string;
};

export const DatabaseEventTrigger = (
  _: DatabaseEventTriggerOptions,
): ClassDecorator => {
  return () => {};
};
