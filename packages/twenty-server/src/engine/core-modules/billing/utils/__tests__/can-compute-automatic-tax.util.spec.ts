/* @license Enterprise */

import { canComputeAutomaticTax } from 'src/engine/core-modules/billing/utils/can-compute-automatic-tax.util';

describe('canComputeAutomaticTax', () => {
  it.each(['supported', 'not_collecting'] as const)(
    'computes tax for a %s customer',
    (status) => {
      expect(canComputeAutomaticTax(status)).toBe(true);
    },
  );

  it.each(['unrecognized_location', 'failed'] as const)(
    'skips tax for a %s customer',
    (status) => {
      expect(canComputeAutomaticTax(status)).toBe(false);
    },
  );

  it('skips tax when the customer is gone', () => {
    expect(canComputeAutomaticTax(null)).toBe(false);
  });
});
