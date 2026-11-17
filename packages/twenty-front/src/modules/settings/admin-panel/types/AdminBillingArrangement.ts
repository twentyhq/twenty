import { type WorkspaceBillingArrangementsQuery } from '~/generated-admin/graphql';

export type AdminBillingArrangement =
  WorkspaceBillingArrangementsQuery['workspaceBillingArrangements'][number];
