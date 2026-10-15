import {
  type ApplicationBilling,
  type ApplicationManifest,
  type ApplicationVariable,
  type BillableOperationManifest,
  type RecurringCharge,
  type ServerVariables,
} from 'twenty-shared/application';

import {
  type WithTranslatableOptionLabels,
  type WithTranslatableProperties,
} from '@/app/manifest/types/translatable-text.type';

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

type TranslatableApplicationBilling = Omit<
  WithTranslatableProperties<ApplicationBilling, 'description'>,
  'recurring' | 'operations'
> & {
  recurring?: Partial<
    Record<string, WithTranslatableProperties<RecurringCharge, 'label'>>
  >;
  operations?: Partial<
    Record<
      string,
      WithTranslatableProperties<BillableOperationManifest, 'label'>
    >
  >;
};

export type TranslatableApplicationConfig = Omit<
  WithTranslatableProperties<ApplicationConfig, 'displayName' | 'description'>,
  'applicationVariables' | 'serverVariables' | 'billing'
> & {
  applicationVariables?: Record<
    string,
    WithTranslatableOptionLabels<
      WithTranslatableProperties<ApplicationVariable, 'label' | 'description'>
    >
  >;
  serverVariables?: Record<
    string,
    WithTranslatableOptionLabels<
      WithTranslatableProperties<ServerVariables[string], 'description'>
    >
  >;
  billing?: TranslatableApplicationBilling;
};
