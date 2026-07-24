import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasAttemptedCompanyEnrichmentFetchState = createAtomState<boolean>(
  {
    key: 'hasAttemptedCompanyEnrichmentFetchState',
    defaultValue: false,
  },
);
