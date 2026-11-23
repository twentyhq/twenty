import { doesApplicationBillCredits } from 'src/engine/core-modules/application/utils/does-application-bill-credits.util';

describe('doesApplicationBillCredits', () => {
  it('should bill credits when the app declares a billable operation', () => {
    expect(
      doesApplicationBillCredits({
        operations: {
          recordMeeting: {
            operationType: 'CALL_RECORDING',
            label: 'Meeting recording',
          },
        },
      }),
    ).toBe(true);
  });

  it('should bill credits when the app declares a recurring charge', () => {
    expect(
      doesApplicationBillCredits({
        recurring: {
          platformFee: {
            period: 'MONTH',
            amountMicroCredits: 20_000_000,
            label: 'Platform fee',
          },
        },
      }),
    ).toBe(true);
  });

  it('should bill when the app declares a subscription price', () => {
    expect(
      doesApplicationBillCredits({
        prices: [
          {
            universalIdentifier: 'b1f0c6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b',
            label: 'Per connected account',
            type: 'RECURRING',
            billingPeriod: 'MONTHLY',
            amountCents: 700,
            per: 'CONNECTED_ACCOUNT',
          },
        ],
      }),
    ).toBe(true);
  });

  it('should not bill credits for a pricing line alone', () => {
    expect(
      doesApplicationBillCredits({ description: 'Free while in beta' }),
    ).toBe(false);
  });

  it('should not bill credits without a billing declaration', () => {
    expect(doesApplicationBillCredits(undefined)).toBe(false);
    expect(
      doesApplicationBillCredits({ operations: {}, recurring: {}, prices: [] }),
    ).toBe(false);
  });
});
