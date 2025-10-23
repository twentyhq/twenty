import { type SyncableEntityOptions } from '@/decorators/types/syncable-entity-options.type';

type CronTriggerOptions = SyncableEntityOptions & {
  pattern: string;
};

export const CronTrigger = (_: CronTriggerOptions): ClassDecorator => {
  return () => {};
};
