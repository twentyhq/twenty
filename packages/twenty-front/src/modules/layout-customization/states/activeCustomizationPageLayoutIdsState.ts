import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const activeCustomizationPageLayoutIdsState = createAtomState<string[]>({
  key: 'activeCustomizationPageLayoutIdsState',
  defaultValue: [],
});
