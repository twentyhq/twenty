import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatInputStateV2 = createAtomState<string>({
  key: 'agentChatInputStateV2',
  defaultValue: '',
});
