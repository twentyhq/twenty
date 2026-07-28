import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Deliberately not persisted: an in-flight request cannot survive a reload, and a stale
// stored `true` would make the workspace setup kickoff wait for a request that never settles.
export const isCompanyEnrichmentFetchInFlightState = createAtomState<boolean>({
  key: 'isCompanyEnrichmentFetchInFlightState',
  defaultValue: false,
});
