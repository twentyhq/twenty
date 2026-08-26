import { createStore } from 'jotai';

import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';
import { waitForCompanyEnrichmentSettlement } from '@/onboarding/utils/waitForCompanyEnrichmentSettlement';

const trackResolution = (settlement: Promise<void>) => {
  const resolution = { hasResolved: false };

  void settlement.then(() => {
    resolution.hasResolved = true;
  });

  return resolution;
};

describe('waitForCompanyEnrichmentSettlement', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should resolve immediately when the fetch already settled', async () => {
    const store = createStore();

    store.set(hasAttemptedCompanyEnrichmentFetchState.atom, true);

    await expect(
      waitForCompanyEnrichmentSettlement({ store, timeoutMs: 10_000 }),
    ).resolves.toBeUndefined();
  });

  it('should resolve immediately when the enrichment is already known', async () => {
    const store = createStore();

    store.set(companyEnrichmentState.atom, { domain: 'acme.com' } as never);

    await expect(
      waitForCompanyEnrichmentSettlement({ store, timeoutMs: 10_000 }),
    ).resolves.toBeUndefined();
  });

  it('should wait for a fetch that has not started yet', async () => {
    const store = createStore();

    const settlement = waitForCompanyEnrichmentSettlement({
      store,
      timeoutMs: 10_000,
    });
    const resolution = trackResolution(settlement);

    await Promise.resolve();
    expect(resolution.hasResolved).toBe(false);

    store.set(isCompanyEnrichmentFetchInFlightState.atom, true);
    store.set(hasAttemptedCompanyEnrichmentFetchState.atom, true);

    await Promise.resolve();
    expect(resolution.hasResolved).toBe(false);

    store.set(isCompanyEnrichmentFetchInFlightState.atom, false);

    await expect(settlement).resolves.toBeUndefined();
  });

  it('should resolve as soon as the fetch settles', async () => {
    const store = createStore();

    store.set(hasAttemptedCompanyEnrichmentFetchState.atom, true);
    store.set(isCompanyEnrichmentFetchInFlightState.atom, true);

    const settlement = waitForCompanyEnrichmentSettlement({
      store,
      timeoutMs: 10_000,
    });
    const resolution = trackResolution(settlement);

    await Promise.resolve();
    expect(resolution.hasResolved).toBe(false);

    store.set(isCompanyEnrichmentFetchInFlightState.atom, false);

    await expect(settlement).resolves.toBeUndefined();
  });

  it('should resolve on timeout so a slow enrichment cannot block onboarding', async () => {
    const store = createStore();

    store.set(hasAttemptedCompanyEnrichmentFetchState.atom, true);
    store.set(isCompanyEnrichmentFetchInFlightState.atom, true);

    await expect(
      waitForCompanyEnrichmentSettlement({ store, timeoutMs: 1 }),
    ).resolves.toBeUndefined();

    expect(store.get(isCompanyEnrichmentFetchInFlightState.atom)).toBe(true);
  });
});
