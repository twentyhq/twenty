import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const activeSessionNameState = createStateV2<string | null>({
  key: 'activeSessionNameState',
  defaultValue: null,
  useLocalStorage: true,
});
