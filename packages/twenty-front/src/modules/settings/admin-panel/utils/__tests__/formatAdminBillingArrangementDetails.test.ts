import { type AdminBillingArrangement } from '@/settings/admin-panel/types/AdminBillingArrangement';
import { formatAdminBillingArrangementDetails } from '@/settings/admin-panel/utils/formatAdminBillingArrangementDetails';
import {
  BillingArrangementLabel,
  BillingArrangementSeatCapMode,
  BillingArrangementStatus,
  BillingArrangementType,
  UsageOperationType,
  UsageResourceType,
  UsageUnit,
} from '~/generated-admin/graphql';

const formatNumber = (value: number, options?: { decimals?: number }) =>
  value.toFixed(options?.decimals ?? 0);

const formatLimitValue = ({ value }: { value: number }) => `${value} credits`;

const arrangement = (
  overrides: Partial<AdminBillingArrangement>,
): AdminBillingArrangement => ({
  __typename: 'AdminPanelWorkspaceBillingArrangement',
  id: '20202020-0000-4000-8000-000000000001',
  type: BillingArrangementType.FREE_SEATS,
  label: BillingArrangementLabel.OTHER,
  comment: null,
  seats: null,
  seatCapMode: null,
  stripeDiscountId: null,
  creditAllowance: null,
  stripeCreditNoteId: null,
  creditGrantId: null,
  usageLimit: null,
  startsAt: '2026-11-01T00:00:00.000Z',
  endDate: null,
  status: BillingArrangementStatus.ACTIVE,
  isManageable: true,
  grantedBy: null,
  revokedBy: null,
  createdAt: '2026-11-01T00:00:00.000Z',
  ...overrides,
});

const format = (overrides: Partial<AdminBillingArrangement>) =>
  formatAdminBillingArrangementDetails({
    arrangement: arrangement(overrides),
    formatNumber,
    formatLimitValue,
  });

describe('formatAdminBillingArrangementDetails', () => {
  it('shows committed seats with their cap mode', () => {
    expect(
      format({
        type: BillingArrangementType.COMMITTED_SEATS,
        seats: 12,
        seatCapMode: BillingArrangementSeatCapMode.HARD,
      }),
    ).toBe('12 seats · Hard cap');
  });

  it('agrees in number with a single free seat', () => {
    expect(format({ type: BillingArrangementType.FREE_SEATS, seats: 1 })).toBe(
      '1 seat',
    );
  });

  it('shows a credit allowance per month', () => {
    expect(
      format({
        type: BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE,
        creditAllowance: 50,
      }),
    ).toBe('50.00 credits/month');
  });

  it('shows a zero credit allowance rather than a dash', () => {
    expect(
      format({
        type: BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE,
        creditAllowance: 0,
      }),
    ).toBe('0.00 credits/month');
  });

  it('shows the Stripe discount a discount mirrors', () => {
    expect(
      format({
        type: BillingArrangementType.DISCOUNT,
        stripeDiscountId: 'di_123',
      }),
    ).toBe('di_123');
  });

  it('shows the scope, value and period of a limit override', () => {
    expect(
      format({
        type: BillingArrangementType.LIMIT_OVERRIDE,
        usageLimit: {
          __typename: 'UsageLimit',
          id: '20202020-0000-4000-8000-000000000002',
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          periodCount: 1,
          periodUnit: 'week',
          unit: UsageUnit.CREDIT,
          limitValue: '500',
        },
      }),
    ).toBe('AI · Chats · 500 credits · Week');
  });

  it('says the limit was removed once the override ended', () => {
    expect(
      format({ type: BillingArrangementType.LIMIT_OVERRIDE, usageLimit: null }),
    ).toBe('Limit removed');
  });
});
