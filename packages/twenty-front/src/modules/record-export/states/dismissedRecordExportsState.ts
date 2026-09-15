import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const dismissedRecordExportsState = createAtomState<string[]>({
  key: 'dismissedRecordExportsState',
  defaultValue: [],
  useLocalStorage: true,
});
