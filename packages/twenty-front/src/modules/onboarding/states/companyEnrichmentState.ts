import { isNonEmptyString } from '@sniptt/guards';

import { type CompanyEnrichmentStoreValue } from '@/onboarding/types/CompanyEnrichmentStoreValue';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const companyEnrichmentState =
  createAtomState<CompanyEnrichmentStoreValue | null>({
    key: 'companyEnrichmentState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (payload) => isNonEmptyString(payload.fetchedAt),
  });
