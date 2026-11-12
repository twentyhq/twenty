import { type WorkspaceBillingAdminPanelQuery } from '~/generated-admin/graphql';

export type AdminBillingArrangement = NonNullable<
  WorkspaceBillingAdminPanelQuery['workspaceBillingAdminPanel']
>['billingArrangements'][number];
