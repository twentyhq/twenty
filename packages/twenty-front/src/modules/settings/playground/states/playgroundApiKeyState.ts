import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const playgroundApiKeyState = createAtomState<string | null>({
  key: 'playgroundApiKeyState',
  defaultValue: null,
  useLocalStorage: true,
});
