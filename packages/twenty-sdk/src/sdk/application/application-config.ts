import { type ApplicationManifest } from 'twenty-shared/application';

export type ApplicationConfig = Omit<
  ApplicationManifest,
  'packageJsonChecksum' | 'yarnLockChecksum'
>;
