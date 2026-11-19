import { formatAdminBillingArrangementEndDate } from '@/settings/admin-panel/utils/formatAdminBillingArrangementEndDate';
import { BillingArrangementStatus } from '~/generated-admin/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

describe('formatAdminBillingArrangementEndDate', () => {
  it('should show a dash for one-time arrangements', () => {
    expect(
      formatAdminBillingArrangementEndDate({
        status: BillingArrangementStatus.ONE_TIME,
        endDate: null,
      }),
    ).toBe('—');
  });

  it('should show Never when there is no end date', () => {
    expect(
      formatAdminBillingArrangementEndDate({
        status: BillingArrangementStatus.ACTIVE,
        endDate: null,
      }),
    ).toBe('Never');
  });

  it('should show the end date', () => {
    const endDate = '2026-12-01T00:00:00.000Z';

    expect(
      formatAdminBillingArrangementEndDate({
        status: BillingArrangementStatus.ENDED,
        endDate,
      }),
    ).toBe(beautifyExactDate(endDate));
  });
});
