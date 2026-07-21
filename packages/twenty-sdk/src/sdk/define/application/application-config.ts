import { type ApplicationManifest } from 'twenty-shared/application';

export type ApplicationConfig = Omit<
  ApplicationManifest,
  | 'packageJsonChecksum'
  | 'yarnLockChecksum'
  | 'requiredServerVersionRange'
  | 'postInstallLogicFunction'
  | 'preInstallLogicFunction'
  | 'defaultRoleUniversalIdentifier'
  | 'aboutDescription'
> & {
  /**
   * @deprecated Use `defineApplicationRole()` in your role file instead.
   */
  defaultRoleUniversalIdentifier?: string;
};
