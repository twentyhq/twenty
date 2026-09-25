import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleHeightState = createAtomState<number | null>({
  key: 'logConsoleHeightState',
  defaultValue: null,
  useLocalStorage: true,
});
