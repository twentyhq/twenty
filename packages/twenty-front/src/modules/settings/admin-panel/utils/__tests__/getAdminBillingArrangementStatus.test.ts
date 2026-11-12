import { getAdminBillingArrangementStatus } from '@/settings/admin-panel/utils/getAdminBillingArrangementStatus';
import { BillingArrangementType } from '~/generated-admin/graphql';

const NOW = new Date('2026-11-15T00:00:00.000Z');

const getStatus = (
  overrides: Partial<
    Parameters<typeof getAdminBillingArrangementStatus>[0]['arrangement']
  >,
) =>
  getAdminBillingArrangementStatus({
    arrangement: {
      type: BillingArrangementType.FREE_SEATS,
      isActive: false,
      startsAt: '2026-11-01T00:00:00.000Z',
      endsAt: null,
      revokedAt: null,
      ...overrides,
    },
    now: NOW,
  });

describe('getAdminBillingArrangementStatus', () => {
  it('is active when the server says so', () => {
    expect(getStatus({ isActive: true })).toBe('active');
  });

  it('is scheduled when it starts later', () => {
    expect(getStatus({ startsAt: '2026-12-01T00:00:00.000Z' })).toBe(
      'scheduled',
    );
  });

  it('is ended when it was revoked before its start', () => {
    expect(
      getStatus({
        startsAt: '2026-12-01T00:00:00.000Z',
        revokedAt: '2026-11-10T00:00:00.000Z',
      }),
    ).toBe('ended');
  });

  it('is ended once its end date has passed', () => {
    expect(getStatus({ endsAt: '2026-11-10T00:00:00.000Z' })).toBe('ended');
  });

  it('is one-time for refunds', () => {
    expect(getStatus({ type: BillingArrangementType.REFUND })).toBe('one-time');
  });
});
