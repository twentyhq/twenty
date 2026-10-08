import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCompanyEnrichmentEnabledState = createAtomState<boolean>({
  key: 'isCompanyEnrichmentEnabledState',
  defaultValue: false,
});
