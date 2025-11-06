import { type SyncableEntityOptions } from '@/application/syncable-entity-options.type';

type ApplicationVariable = SyncableEntityOptions & {
  value?: string;
  description?: string;
  isSecret?: boolean;
};

export type ApplicationConfig = SyncableEntityOptions & {
  displayName?: string;
  description?: string;
  icon?: string;
  applicationVariables?: Record<string, ApplicationVariable>;
};
