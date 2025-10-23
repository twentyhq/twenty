import { type SyncableEntityOptions } from '@/decorators/types/syncable-entity-options.type';

type VariableOptions = SyncableEntityOptions & {
  key: string;
  value?: string;
  description?: string;
  isSecret?: boolean;
};

export const Variable = (_: VariableOptions): ClassDecorator => {
  return () => {};
};
