import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatFirstLiveSeqState = createAtomState<number | null>({
  key: 'agentChatFirstLiveSeqState',
  defaultValue: null,
});
