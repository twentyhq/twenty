import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const playgroundApiKeyState = createState<string | null>({
  key: 'playgroundApiKeyState',
  defaultValue: null,
  useLocalStorage: true,
});
