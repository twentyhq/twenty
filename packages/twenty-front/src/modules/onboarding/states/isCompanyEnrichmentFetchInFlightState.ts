import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCompanyEnrichmentFetchInFlightState = createAtomState<boolean>({
  key: 'isCompanyEnrichmentFetchInFlightState',
  defaultValue: false,
});
