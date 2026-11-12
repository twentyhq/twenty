import { isDefined } from 'twenty-shared/utils';

import { type AdminBillingArrangement } from '@/settings/admin-panel/types/AdminBillingArrangement';

export const getAdminBillingArrangementEndDate = ({
  endsAt,
  revokedAt,
}: Pick<AdminBillingArrangement, 'endsAt' | 'revokedAt'>): Date | null => {
  const endDates = [endsAt, revokedAt]
    .filter(isDefined)
    .map((date) => new Date(date).getTime());

  return endDates.length > 0 ? new Date(Math.min(...endDates)) : null;
};
