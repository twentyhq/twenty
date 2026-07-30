import { type createStore } from 'jotai';

import { COMPANY_ENRICHMENT_SETTLEMENT_TIMEOUT_MS } from '@/onboarding/constants/CompanyEnrichmentSettlementTimeoutMs';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';

type JotaiStore = ReturnType<typeof createStore>;

export const waitForCompanyEnrichmentSettlement = ({
  store,
  timeoutMs = COMPANY_ENRICHMENT_SETTLEMENT_TIMEOUT_MS,
}: {
  store: JotaiStore;
  timeoutMs?: number;
}): Promise<void> =>
  new Promise((resolve) => {
    if (!store.get(isCompanyEnrichmentFetchInFlightState.atom)) {
      resolve();

      return;
    }

    let unsubscribe: (() => void) | undefined;

    const timeout = setTimeout(() => {
      unsubscribe?.();
      resolve();
    }, timeoutMs);

    unsubscribe = store.sub(isCompanyEnrichmentFetchInFlightState.atom, () => {
      if (store.get(isCompanyEnrichmentFetchInFlightState.atom)) {
        return;
      }

      clearTimeout(timeout);
      unsubscribe?.();
      resolve();
    });
  });
