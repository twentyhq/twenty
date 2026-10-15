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

type ApplicationBillingConfig = Omit<
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

export type ApplicationConfig = Omit<
  WithTranslatableProperties<
    ApplicationManifest,
    'displayName' | 'description'
  >,
  | 'packageJsonChecksum'
  | 'yarnLockChecksum'
  | 'requiredServerVersionRange'
  | 'postInstallLogicFunction'
  | 'preInstallLogicFunction'
  | 'settingsFrontComponent'
  | 'defaultRoleUniversalIdentifier'
  | 'aboutDescription'
  | 'applicationVariables'
  | 'serverVariables'
  | 'billing'
> & {
  defaultRoleUniversalIdentifier?: string;
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
  billing?: ApplicationBillingConfig;
};
