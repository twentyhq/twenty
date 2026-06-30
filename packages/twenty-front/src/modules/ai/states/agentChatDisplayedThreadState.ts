import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatDisplayedThreadState = createAtomState<string | null>({
  key: 'ai/agentChatDisplayedThreadState',
  defaultValue: null,
});
