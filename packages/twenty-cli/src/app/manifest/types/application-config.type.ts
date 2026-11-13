import {
  type InstallableApplicationManifest,
  type OAuthClientApplicationManifest,
} from 'twenty-shared/application';

type ApplicationConfigOmittedKey =
  | 'packageJsonChecksum'
  | 'yarnLockChecksum'
  | 'requiredServerVersionRange'
  | 'postInstallLogicFunction'
  | 'preInstallLogicFunction'
  | 'settingsFrontComponent'
  | 'defaultRoleUniversalIdentifier'
  | 'aboutDescription';

export type InstallableApplicationConfig = Omit<
  InstallableApplicationManifest,
  ApplicationConfigOmittedKey
> & {
  defaultRoleUniversalIdentifier?: string;
};

export type OAuthClientApplicationConfig = Omit<
  OAuthClientApplicationManifest,
  ApplicationConfigOmittedKey
> & {
  defaultRoleUniversalIdentifier?: never;
};

export type ApplicationConfig =
  | InstallableApplicationConfig
  | OAuthClientApplicationConfig;
