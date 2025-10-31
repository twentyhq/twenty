import { type SyncableEntityOptions } from '@/application/types/syncable-entity-options.type';

type ObjectMetadataOptions = SyncableEntityOptions & {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
};

export const ObjectMetadata = (_: ObjectMetadataOptions): ClassDecorator => {
  return () => {};
};
