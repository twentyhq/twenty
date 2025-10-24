import { type SyncableEntityOptions } from '@/types/syncable-entity-options.type';

type ApplicationVariableOptions = SyncableEntityOptions & {
  key: string;
  value?: string;
  description?: string;
  isSecret?: boolean;
};

export const ApplicationVariable = (
  _: ApplicationVariableOptions,
): ClassDecorator => {
  return () => {};
};
