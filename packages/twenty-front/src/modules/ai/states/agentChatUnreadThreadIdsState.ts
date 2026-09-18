import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatUnreadThreadIdsState = createAtomState<string[]>({
  key: 'agentChatUnreadThreadIdsState',
  defaultValue: [],
});
