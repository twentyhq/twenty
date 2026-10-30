/* @license Enterprise */

import { BillingArrangementLabel } from 'src/engine/core-modules/billing/enums/billing-arrangement-label.enum';
import { BillingArrangementSeatCapMode } from 'src/engine/core-modules/billing/enums/billing-arrangement-seat-cap-mode.enum';
import { BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementDraft } from 'src/engine/core-modules/billing/types/billing-arrangement-draft.type';
import { getBillingArrangementValidationErrors } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-validation-errors.util';

const STARTS_AT = new Date('2026-11-01T00:00:00.000Z');

const draft = (
  overrides: Partial<BillingArrangementDraft> &
    Pick<BillingArrangementDraft, 'type'>,
): BillingArrangementDraft => ({
  label: BillingArrangementLabel.OTHER,
  comment: null,
  startsAt: STARTS_AT,
  endsAt: null,
  seats: null,
  seatCapMode: null,
  stripePriceId: null,
  stripeCouponId: null,
  creditAllowanceMicro: null,
  stripeCreditNoteId: null,
  creditGrantId: null,
  usageLimitId: null,
  ...overrides,
});

describe('getBillingArrangementValidationErrors', () => {
  it.each<[string, BillingArrangementDraft]>([
    [
      'committed seats with a negotiated price',
      draft({
        type: BillingArrangementType.COMMITTED_SEATS,
        seats: 50,
        seatCapMode: BillingArrangementSeatCapMode.SOFT,
        stripePriceId: 'price_deal',
        endsAt: new Date('2027-11-01T00:00:00.000Z'),
      }),
    ],
    [
      'free seats with no end date',
      draft({ type: BillingArrangementType.FREE_SEATS, seats: 3 }),
    ],
    [
      'a coupon',
      draft({
        type: BillingArrangementType.COUPON,
        stripeCouponId: 'coupon_non_profit',
      }),
    ],
    [
      'a trial extension',
      draft({
        type: BillingArrangementType.TRIAL_EXTENSION,
        endsAt: new Date('2026-11-15T00:00:00.000Z'),
      }),
    ],
    [
      'a user credit allowance of 0',
      draft({
        type: BillingArrangementType.USER_CREDIT_ALLOWANCE,
        creditAllowanceMicro: 0,
      }),
    ],
    [
      'a refund',
      draft({
        type: BillingArrangementType.REFUND,
        stripeCreditNoteId: 'cn_123',
      }),
    ],
  ])('accepts %s', (_, arrangement) => {
    expect(getBillingArrangementValidationErrors(arrangement)).toEqual([]);
  });

  it('reports the settings a type requires', () => {
    expect(
      getBillingArrangementValidationErrors(
        draft({ type: BillingArrangementType.COMMITTED_SEATS }),
      ),
    ).toEqual([
      { code: 'MISSING_SETTING', setting: 'seats' },
      { code: 'MISSING_SETTING', setting: 'seatCapMode' },
    ]);
  });

  it('treats an empty string as a missing setting', () => {
    expect(
      getBillingArrangementValidationErrors(
        draft({
          type: BillingArrangementType.COUPON,
          stripeCouponId: '',
        }),
      ),
    ).toEqual([{ code: 'MISSING_SETTING', setting: 'stripeCouponId' }]);
  });

  it('reports settings that belong to another type', () => {
    expect(
      getBillingArrangementValidationErrors(
        draft({
          type: BillingArrangementType.FREE_SEATS,
          seats: 3,
          stripeCouponId: 'coupon_non_profit',
        }),
      ),
    ).toEqual([{ code: 'UNEXPECTED_SETTING', setting: 'stripeCouponId' }]);
  });

  it.each([0, -1, 1.5])('rejects %s seats', (seats) => {
    expect(
      getBillingArrangementValidationErrors(
        draft({ type: BillingArrangementType.FREE_SEATS, seats }),
      ),
    ).toEqual([{ code: 'INVALID_SEATS' }]);
  });

  it.each([-1, Number.MAX_SAFE_INTEGER + 1])(
    'rejects a credit allowance of %s',
    (creditAllowanceMicro) => {
      expect(
        getBillingArrangementValidationErrors(
          draft({
            type: BillingArrangementType.WORKSPACE_CREDIT_ALLOWANCE,
            creditAllowanceMicro,
          }),
        ),
      ).toEqual([{ code: 'INVALID_CREDIT_ALLOWANCE' }]);
    },
  );

  it('rejects an end date on a one-time type', () => {
    expect(
      getBillingArrangementValidationErrors(
        draft({
          type: BillingArrangementType.CREDIT_GRANT,
          creditGrantId: '20202020-0000-4000-8000-000000000001',
          endsAt: new Date('2026-12-01T00:00:00.000Z'),
        }),
      ),
    ).toEqual([{ code: 'UNEXPECTED_SETTING', setting: 'endsAt' }]);
  });

  it('requires an end date on a trial extension', () => {
    expect(
      getBillingArrangementValidationErrors(
        draft({ type: BillingArrangementType.TRIAL_EXTENSION }),
      ),
    ).toEqual([{ code: 'MISSING_SETTING', setting: 'endsAt' }]);
  });

  it.each([
    ['before', new Date('2026-10-01T00:00:00.000Z')],
    ['at', STARTS_AT],
  ])('rejects an end date %s the start', (_, endsAt) => {
    expect(
      getBillingArrangementValidationErrors(
        draft({ type: BillingArrangementType.FREE_SEATS, seats: 3, endsAt }),
      ),
    ).toEqual([{ code: 'ENDS_BEFORE_START' }]);
  });
});
