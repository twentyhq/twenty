import { plural, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FormatNumberOptions } from '@/localization/utils/formatNumber';
import { BILLING_ARRANGEMENT_SEAT_CAP_MODE_LABELS } from '@/settings/admin-panel/constants/BillingArrangementSeatCapModeLabels';
import { type AdminBillingArrangement } from '@/settings/admin-panel/types/AdminBillingArrangement';
import { BillingArrangementType } from '~/generated-admin/graphql';

const EM_DASH = '—';

const formatSeats = ({
  seats,
  formatNumber,
}: {
  seats: number;
  formatNumber: (value: number) => string;
}): string =>
  `${formatNumber(seats)} ${plural(seats, { one: 'seat', other: 'seats' })}`;

export const formatAdminBillingArrangementDetails = ({
  arrangement,
  formatNumber,
}: {
  arrangement: AdminBillingArrangement;
  formatNumber: (
    value: number,
    options?: Omit<FormatNumberOptions, 'format'>,
  ) => string;
}): string => {
  switch (arrangement.type) {
    case BillingArrangementType.COMMITTED_SEATS:
    case BillingArrangementType.FREE_SEATS: {
      if (!isDefined(arrangement.seats)) {
        return EM_DASH;
      }

      const seats = formatSeats({ seats: arrangement.seats, formatNumber });

      return isDefined(arrangement.seatCapMode)
        ? `${seats} · ${t(BILLING_ARRANGEMENT_SEAT_CAP_MODE_LABELS[arrangement.seatCapMode])}`
        : seats;
    }
    case BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE: {
      if (!isDefined(arrangement.creditAllowance)) {
        return EM_DASH;
      }

      const credits = formatNumber(arrangement.creditAllowance, {
        decimals: 2,
      });

      return t`${credits} credits/month`;
    }
    case BillingArrangementType.DISCOUNT:
      return arrangement.stripeDiscountId ?? EM_DASH;
    case BillingArrangementType.REFUND:
      return arrangement.stripeCreditNoteId ?? EM_DASH;
    case BillingArrangementType.CREDIT_GRANT:
      return arrangement.creditGrantId ?? EM_DASH;
    case BillingArrangementType.LIMIT_OVERRIDE:
      return arrangement.usageLimitId ?? EM_DASH;
    case BillingArrangementType.TRIAL_EXTENSION:
      return EM_DASH;
  }
};
