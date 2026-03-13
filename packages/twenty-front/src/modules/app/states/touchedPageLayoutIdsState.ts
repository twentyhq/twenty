import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const touchedPageLayoutIdsState = createAtomState<Set<string>>({
  key: 'touchedPageLayoutIdsState',
  defaultValue: new Set(),
});
