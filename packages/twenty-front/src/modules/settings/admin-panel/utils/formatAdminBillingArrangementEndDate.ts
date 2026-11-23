import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type AdminBillingArrangement } from '@/settings/admin-panel/types/AdminBillingArrangement';
import { BillingArrangementStatus } from '~/generated-admin/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

const EM_DASH = '—';

export const formatAdminBillingArrangementEndDate = (
  arrangement: Pick<AdminBillingArrangement, 'status' | 'endDate'>,
): string => {
  if (arrangement.status === BillingArrangementStatus.ONE_TIME) {
    return EM_DASH;
  }

  return isDefined(arrangement.endDate)
    ? beautifyExactDate(arrangement.endDate)
    : t`Never`;
};
