import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatViewedThreadIdState = createAtomState<string | null>({
  key: 'ai/agentChatViewedThreadIdState',
  defaultValue: null,
});
