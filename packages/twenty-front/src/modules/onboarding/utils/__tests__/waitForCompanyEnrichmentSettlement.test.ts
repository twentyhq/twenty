import { createStore } from 'jotai';

import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';
import { waitForCompanyEnrichmentSettlement } from '@/onboarding/utils/waitForCompanyEnrichmentSettlement';

describe('waitForCompanyEnrichmentSettlement', () => {
  it('should resolve immediately when no fetch is in flight', async () => {
    const store = createStore();

    await expect(
      waitForCompanyEnrichmentSettlement({ store, timeoutMs: 10_000 }),
    ).resolves.toBeUndefined();
  });

  it('should resolve as soon as the fetch settles', async () => {
    const store = createStore();

    store.set(isCompanyEnrichmentFetchInFlightState.atom, true);

    const settlement = waitForCompanyEnrichmentSettlement({
      store,
      timeoutMs: 10_000,
    });

    let hasResolved = false;

    void settlement.then(() => {
      hasResolved = true;
    });

    await Promise.resolve();
    expect(hasResolved).toBe(false);

    store.set(isCompanyEnrichmentFetchInFlightState.atom, false);

    await expect(settlement).resolves.toBeUndefined();
  });

  it('should resolve on timeout so a slow enrichment cannot block onboarding', async () => {
    const store = createStore();

    store.set(isCompanyEnrichmentFetchInFlightState.atom, true);

    await expect(
      waitForCompanyEnrichmentSettlement({ store, timeoutMs: 1 }),
    ).resolves.toBeUndefined();

    expect(store.get(isCompanyEnrichmentFetchInFlightState.atom)).toBe(true);
  });
});
