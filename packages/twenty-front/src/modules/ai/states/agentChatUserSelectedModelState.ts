import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatUserSelectedModelState = createAtomState<string | null>({
  key: 'ai/agentChatUserSelectedModel',
  defaultValue: null,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
