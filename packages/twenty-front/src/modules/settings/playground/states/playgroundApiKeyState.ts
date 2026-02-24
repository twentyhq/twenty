import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const playgroundApiKeyState = createStateV2<string | null>({
  key: 'playgroundApiKeyState',
  defaultValue: null,
  useLocalStorage: true,
});
