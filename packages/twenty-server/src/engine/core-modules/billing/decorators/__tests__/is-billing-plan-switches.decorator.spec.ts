/* @license Enterprise */

import { validateSync } from 'class-validator';

import { IsBillingPlanSwitches } from 'src/engine/core-modules/billing/decorators/is-billing-plan-switches.decorator';

describe('IsBillingPlanSwitches', () => {
  class ConfigVariables {
    @IsBillingPlanSwitches()
    planSwitches: unknown;
  }

  const validate = (planSwitches: unknown) =>
    validateSync(Object.assign(new ConfigVariables(), { planSwitches }));

  it.each([
    {
      PRO: { upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { upgradePlanKeys: ['PRO_V2', 'ORGANIZATION_V2'] },
      ENTERPRISE: {
        upgradePlanKeys: ['ORGANIZATION_V2'],
        downgradePlanKeys: ['PRO_V2'],
      },
      PRO_V2: { upgradePlanKeys: ['ORGANIZATION_V2'], downgradePlanKeys: [] },
      ORGANIZATION_V2: { downgradePlanKeys: ['PRO_V2'] },
    },
  ])('accepts %j', (planSwitches) => {
    expect(validate(planSwitches)).toHaveLength(0);
  });

  it.each([
    [],
    'PRO',
    {},
    { PRO: { upgradePlanKeys: ['ENTERPRISE'] } },
    {
      PRO: { upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { upgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
      PRO_V2: { upgradePlanKeys: ['ORGANIZATION_V2'] },
      ORGANIZATION_V2: { downgradePlanKeys: ['PRO_V2'] },
    },
    {
      UNKNOWN: { upgradePlanKeys: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { upgradePlanKeys: ['ENTERPRSE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { upgradePlanKeys: 'ENTERPRISE' },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    {
      PRO: { upgrades: ['ENTERPRISE'] },
      ENTERPRISE: { downgradePlanKeys: ['PRO'] },
    },
    { PRO: ['ENTERPRISE'], ENTERPRISE: { downgradePlanKeys: ['PRO'] } },
  ])('refuses %j', (planSwitches) => {
    expect(validate(planSwitches)).toHaveLength(1);
  });
});
