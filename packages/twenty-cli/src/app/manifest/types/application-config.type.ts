import {
  type ApplicationManifest,
  type ApplicationVariable,
  type ServerVariables,
} from 'twenty-shared/application';

import { type WithTranslatableOptionLabels } from '@/app/manifest/types/translatable-option-labels.type';

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

export type TranslatableApplicationConfig = Omit<
  ApplicationConfig,
  'applicationVariables' | 'serverVariables'
> & {
  applicationVariables?: Record<
    string,
    WithTranslatableOptionLabels<ApplicationVariable>
  >;
  serverVariables?: Record<
    string,
    WithTranslatableOptionLabels<ServerVariables[string]>
  >;
};
