import type { Store } from 'jotai/vanilla/store';
import { isDefined } from 'twenty-shared/utils';

import { COMPANY_ENRICHMENT_SETTLEMENT_TIMEOUT_MS } from '@/onboarding/constants/CompanyEnrichmentSettlementTimeoutMs';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasAttemptedCompanyEnrichmentFetchState } from '@/onboarding/states/hasAttemptedCompanyEnrichmentFetchState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';

const COMPANY_ENRICHMENT_SETTLEMENT_ATOMS = [
  companyEnrichmentState.atom,
  hasAttemptedCompanyEnrichmentFetchState.atom,
  isCompanyEnrichmentFetchInFlightState.atom,
];

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
      (store.get(hasAttemptedCompanyEnrichmentFetchState.atom) &&
        !store.get(isCompanyEnrichmentFetchInFlightState.atom));

    if (hasAnswer()) {
      resolve();

      return;
    }

    const unsubscribes: (() => void)[] = [];
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let isSettled = false;

    const unsubscribeAll = () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };

    const settle = () => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      clearTimeout(timeout);
      unsubscribeAll();
      resolve();
    };

    const settleWhenAnswered = () => {
      if (hasAnswer()) {
        settle();
      }
    };

    timeout = setTimeout(settle, timeoutMs);

    for (const atom of COMPANY_ENRICHMENT_SETTLEMENT_ATOMS) {
      unsubscribes.push(store.sub(atom, settleWhenAnswered));
    }

    if (isSettled) {
      unsubscribeAll();
    }
  });
