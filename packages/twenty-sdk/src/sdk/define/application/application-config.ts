import { type ApplicationManifest } from 'twenty-shared/application';

export type ApplicationConfig = Omit<
  ApplicationManifest,
  | 'packageJsonChecksum'
  | 'yarnLockChecksum'
  | 'postInstallLogicFunction'
  | 'preInstallLogicFunction'
  | 'defaultRoleUniversalIdentifier'
> & {
  /**
   * @deprecated Use `defineApplicationRole()` in your role file instead.
   */
  defaultRoleUniversalIdentifier?: string;
};
