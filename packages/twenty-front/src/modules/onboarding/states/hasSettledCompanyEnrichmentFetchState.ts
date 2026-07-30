import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasSettledCompanyEnrichmentFetchState = createAtomState<boolean>({
  key: 'hasSettledCompanyEnrichmentFetchState',
  defaultValue: false,
  useSessionStorage: true,
});
