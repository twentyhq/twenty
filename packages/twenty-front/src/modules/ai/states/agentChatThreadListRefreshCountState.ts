import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadListRefreshCountState = createAtomState<number>({
  key: 'agentChatThreadListRefreshCountState',
  defaultValue: 0,
});
