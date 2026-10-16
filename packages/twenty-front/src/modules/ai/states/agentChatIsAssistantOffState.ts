import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatIsAssistantOffState = createAtomState<boolean>({
  key: 'ai/agentChatIsAssistantOff',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
