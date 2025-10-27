import { type SyncableEntityOptions } from '@/types/syncable-entity-options.type';

type ApplicationOptions = SyncableEntityOptions & {
  displayName: string;
  description?: string;
};

export const Application = (_: ApplicationOptions): ClassDecorator => {
  return () => {};
};
