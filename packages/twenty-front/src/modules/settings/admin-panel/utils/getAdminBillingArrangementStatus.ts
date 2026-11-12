import { isDefined } from 'twenty-shared/utils';

import { type AdminBillingArrangement } from '@/settings/admin-panel/types/AdminBillingArrangement';
import { type AdminBillingArrangementStatus } from '@/settings/admin-panel/types/AdminBillingArrangementStatus';
import { getAdminBillingArrangementEndDate } from '@/settings/admin-panel/utils/getAdminBillingArrangementEndDate';
import { BillingArrangementType } from '~/generated-admin/graphql';

const ONE_TIME_BILLING_ARRANGEMENT_TYPES: BillingArrangementType[] = [
  BillingArrangementType.REFUND,
  BillingArrangementType.CREDIT_GRANT,
];

export const getAdminBillingArrangementStatus = ({
  arrangement,
  now,
}: {
  arrangement: Pick<
    AdminBillingArrangement,
    'type' | 'isActive' | 'startsAt' | 'endsAt' | 'revokedAt'
  >;
  now: Date;
}): AdminBillingArrangementStatus => {
  if (ONE_TIME_BILLING_ARRANGEMENT_TYPES.includes(arrangement.type)) {
    return 'one-time';
  }

  if (arrangement.isActive) {
    return 'active';
  }

  const startsAt = new Date(arrangement.startsAt);
  const endDate = getAdminBillingArrangementEndDate(arrangement);

  return startsAt > now && (!isDefined(endDate) || endDate > startsAt)
    ? 'scheduled'
    : 'ended';
};
