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
    {},
    { PRO: { upgradePlanKeys: ['ENTERPRISE'] } },
    {
      PRO_V2: { upgradePlanKeys: ['ORGANIZATION_V2'], downgradePlanKeys: [] },
      ORGANIZATION_V2: { downgradePlanKeys: ['PRO_V2'] },
    },
  ])('accepts %j', (planSwitches) => {
    expect(validate(planSwitches)).toHaveLength(0);
  });

  it.each([
    [],
    'PRO',
    { UNKNOWN: { upgradePlanKeys: ['ENTERPRISE'] } },
    { PRO: { upgradePlanKeys: ['ENTERPRSE'] } },
    { PRO: { upgradePlanKeys: 'ENTERPRISE' } },
    { PRO: { upgrades: ['ENTERPRISE'] } },
    { PRO: ['ENTERPRISE'] },
  ])('refuses %j', (planSwitches) => {
    expect(validate(planSwitches)).toHaveLength(1);
  });
});
