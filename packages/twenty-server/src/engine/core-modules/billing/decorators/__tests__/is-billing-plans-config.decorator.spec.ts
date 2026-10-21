/* @license Enterprise */

import { validateSync } from 'class-validator';

import { IsBillingPlansConfig } from 'src/engine/core-modules/billing/decorators/is-billing-plans-config.decorator';

describe('IsBillingPlansConfig', () => {
  class ConfigVariables {
    @IsBillingPlansConfig()
    plansConfig: unknown;
  }

  const validate = (plansConfig: unknown) =>
    validateSync(Object.assign(new ConfigVariables(), { plansConfig }));

  it.each([
    {
      PRO: { isDefault: true, upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { upgradePlanKeys: ['PRO_V2', 'ORGANIZATION_V2'] },
      ENTERPRISE: {
        upgradePlanKeys: ['ORGANIZATION_V2'],
        downgradePlanKeys: ['PRO_V2'],
      },
      PRO_V2: { isDefault: true, upgradePlanKeys: ['ORGANIZATION_V2'] },
      ORGANIZATION_V2: { isDefault: false, downgradePlanKeys: ['PRO_V2'] },
    },
  ])('accepts %j', (plansConfig) => {
    expect(validate(plansConfig)).toHaveLength(0);
  });

  it.each<unknown>([
    [],
    'PRO',
    {},
    { PRO: { isDefault: true, upgradePlanKeys: ['ENTERPRISE'] } },
    {
      PRO: { upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { isDefault: true, upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { isDefault: true, downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { isDefault: true, upgradePlanKeys: ['PRO_V2', 'ORGANIZATION_V2'] },
      PRO_V2: { upgradePlanKeys: ['ORGANIZATION_V2'] },
      ORGANIZATION_V2: { downgradePlanKeys: ['PRO_V2'] },
    },
    {
      PRO: { isDefault: 'true', upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { isDefault: true, upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
      PRO_V2: { upgradePlanKeys: ['ORGANIZATION_V2'] },
      ORGANIZATION_V2: { downgradePlanKeys: ['PRO_V2'] },
    },
    {
      UNKNOWN: { isDefault: true, upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { isDefault: true, upgradePlanKeys: ['ENTERPRSE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { isDefault: true, upgradePlanKeys: 'ENTERPRISE' },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { isDefault: true, upgrades: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    { PRO: ['ENTERPRISE'], ENTERPRISE: { downgradePlanKeys: ['PRO'] } },
    {
      PRO: {
        isDefault: true,
        upgradePlanKeys: ['ENTERPRISE'],
        toString: ['ENTERPRISE'],
      },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
  ])('refuses %j', (plansConfig) => {
    expect(validate(plansConfig)).toHaveLength(1);
  });
});
