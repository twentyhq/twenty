import { createStore } from 'jotai';

import { hasSettledCompanyEnrichmentFetchState } from '@/onboarding/states/hasSettledCompanyEnrichmentFetchState';
import { waitForCompanyEnrichmentSettlement } from '@/onboarding/utils/waitForCompanyEnrichmentSettlement';

describe('waitForCompanyEnrichmentSettlement', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.useRealTimers();
  });

  it('should resolve immediately when the fetch has already settled', async () => {
    const store = createStore();

    store.set(hasSettledCompanyEnrichmentFetchState.atom, true);

    await expect(
      waitForCompanyEnrichmentSettlement({ store, timeoutMs: 10_000 }),
    ).resolves.toBeUndefined();
  });

  it('should resolve as soon as the fetch settles', async () => {
    const store = createStore();

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

    store.set(hasSettledCompanyEnrichmentFetchState.atom, true);

    await expect(settlement).resolves.toBeUndefined();
  });

  it('should resolve on timeout so a slow enrichment cannot block onboarding', async () => {
    const store = createStore();

    await expect(
      waitForCompanyEnrichmentSettlement({ store, timeoutMs: 1 }),
    ).resolves.toBeUndefined();

    expect(store.get(hasSettledCompanyEnrichmentFetchState.atom)).toBe(false);
  });
});
