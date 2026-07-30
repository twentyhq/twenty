import type { Store } from 'jotai/vanilla/store';
import { isDefined } from 'twenty-shared/utils';

import { COMPANY_ENRICHMENT_SETTLEMENT_TIMEOUT_MS } from '@/onboarding/constants/CompanyEnrichmentSettlementTimeoutMs';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';

export const waitForCompanyEnrichmentSettlement = ({
  store,
  timeoutMs = COMPANY_ENRICHMENT_SETTLEMENT_TIMEOUT_MS,
}: {
  store: Store;
  timeoutMs?: number;
}): Promise<void> =>
  new Promise((resolve) => {
    const hasAnswer = () =>
      isDefined(store.get(companyEnrichmentState.atom)) ||
      !store.get(isCompanyEnrichmentFetchInFlightState.atom);

    if (hasAnswer()) {
      resolve();

      return;
    }

    const settle = () => {
      clearTimeout(timeout);
      unsubscribe();
      resolve();
    };

    const unsubscribe = store.sub(
      isCompanyEnrichmentFetchInFlightState.atom,
      () => {
        if (hasAnswer()) {
          settle();
        }
      },
    );

    const timeout = setTimeout(settle, timeoutMs);
  });
