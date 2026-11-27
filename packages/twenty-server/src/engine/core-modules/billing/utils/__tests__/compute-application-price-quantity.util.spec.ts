import { collectDeclaredApplicationPrices } from 'src/engine/core-modules/billing/utils/collect-declared-application-prices.util';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { computeApplicationPriceQuantity } from 'src/engine/core-modules/billing/utils/compute-application-price-quantity.util';

const counts = { workspaceMemberCount: 7, connectedAccountCount: 3 };

describe('computeApplicationPriceQuantity', () => {
  it('bills a flat price once', () => {
    expect(computeApplicationPriceQuantity({ per: undefined, ...counts })).toBe(
      1,
    );
  });

  it('bills a price per workspace member for each member', () => {
    expect(
      computeApplicationPriceQuantity({ per: 'WORKSPACE_MEMBER', ...counts }),
    ).toBe(7);
  });

  it('bills a price per connected account for each connected account', () => {
    expect(
      computeApplicationPriceQuantity({ per: 'CONNECTED_ACCOUNT', ...counts }),
    ).toBe(3);
  });

  it('bills once a persisted price whose unit is null', () => {
    const [{ price }] = collectDeclaredApplicationPrices({
      applications: [
        {
          id: 'application-id',
          universalIdentifier: 'application-universal-identifier',
          name: 'LinkedIn',
          version: '1.0.0',
          sourceType: ApplicationRegistrationSourceType.NPM,
          deletedAt: null,
          acceptedBillingPrices: JSON.parse(
            '[{"universalIdentifier":"b7e41d08-2a93-4f5c-8d16-0c9e3b5a7f21","label":"Platform fee","type":"RECURRING","billingPeriod":"MONTHLY","amountCents":1000,"per":null}]',
          ),
        },
      ],
    });

    expect(computeApplicationPriceQuantity({ per: price.per, ...counts })).toBe(
      1,
    );
  });
});
