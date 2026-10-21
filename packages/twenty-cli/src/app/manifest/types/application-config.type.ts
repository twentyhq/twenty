import { type ApplicationManifest } from 'twenty-shared/application';

export type ApplicationConfig = Omit<
  ApplicationManifest,
  | 'packageJsonChecksum'
  | 'yarnLockChecksum'
  | 'requiredServerVersionRange'
  | 'postInstallLogicFunction'
  | 'preInstallLogicFunction'
  | 'settingsFrontComponent'
  | 'defaultRoleUniversalIdentifier'
  | 'aboutDescription'
> & {
  defaultRoleUniversalIdentifier?: string;
};
