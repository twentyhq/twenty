import { type SyncableEntityOptions } from '@/types/syncable-entity-options.type';

type CronTriggerOptions = SyncableEntityOptions & {
  pattern: string;
};

export const CronTrigger = (_: CronTriggerOptions): ClassDecorator => {
  return () => {};
};
