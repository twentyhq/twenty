import { type ApplicationBillingPrice } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { collectDeclaredApplicationPrices } from 'src/engine/core-modules/billing/utils/collect-declared-application-prices.util';

type BillableApplication = Parameters<
  typeof collectDeclaredApplicationPrices
>[0]['applications'][number];

const price: ApplicationBillingPrice = {
  universalIdentifier: 'b7e41d08-2a93-4f5c-8d16-0c9e3b5a7f21',
  label: 'Per member',
  type: 'RECURRING',
  billingPeriod: 'MONTHLY',
  amountCents: 1000,
  per: 'WORKSPACE_MEMBER',
};

const application: BillableApplication = {
  id: 'application-id',
  universalIdentifier: 'application-universal-identifier',
  name: 'LinkedIn',
  version: '1.0.0',
  sourceType: ApplicationRegistrationSourceType.NPM,
  deletedAt: null,
  acceptedBillingPrices: [price],
};

const collect = (overrides: Partial<BillableApplication>) =>
  collectDeclaredApplicationPrices({
    applications: [{ ...application, ...overrides }],
  });

describe('collectDeclaredApplicationPrices', () => {
  it('collects the prices an installed application was accepted with', () => {
    expect(collect({})).toEqual([
      {
        applicationId: 'application-id',
        applicationUniversalIdentifier: 'application-universal-identifier',
        applicationName: 'LinkedIn',
        price,
      },
    ]);
  });

  it('throws on a malformed accepted price instead of dropping it', () => {
    expect(() =>
      collect({
        acceptedBillingPrices: [{ ...price, amountCents: -1 }, price],
      }),
    ).toThrow('Invalid or duplicated application billing prices');
  });

  it('throws on accepted prices sharing a universal identifier', () => {
    expect(() => collect({ acceptedBillingPrices: [price, price] })).toThrow(
      'Invalid or duplicated application billing prices',
    );
  });

  it.each<[string, Partial<BillableApplication>]>([
    ['is deleted', { deletedAt: new Date() }],
    ['has not completed its install', { version: null }],
    [
      'is synced from a local source',
      { sourceType: ApplicationRegistrationSourceType.LOCAL },
    ],
    ['was accepted for free', { acceptedBillingPrices: [] }],
    [
      'was installed before prices were accepted',
      { acceptedBillingPrices: null },
    ],
  ])('collects nothing when the application %s', (_, overrides) => {
    expect(collect(overrides)).toEqual([]);
  });
});
