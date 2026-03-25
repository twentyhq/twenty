import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatDisplayedThreadState = createAtomState<string>({
  key: 'ai/agentChatDisplayedThreadState',
  defaultValue: '',
});
