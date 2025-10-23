import { type SyncableEntityOptions } from '@/decorators/types/syncable-entity-options.type';

type ServerlessFunctionOptions = SyncableEntityOptions & {
  name?: string;
  description?: string;
  timeoutSeconds?: number;
};

export const ServerlessFunction = (
  _: ServerlessFunctionOptions,
): ClassDecorator => {
  return () => {};
};
