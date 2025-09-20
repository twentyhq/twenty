import { useSplitPhaseItemsInPrices } from '@/billing/hooks/useSplitPhaseItemsInPrices';

describe('useSplitPhaseItemsInPrices', () => {
  it('should be a function', () => {
    expect(typeof useSplitPhaseItemsInPrices).toBe('function');
  });
});
