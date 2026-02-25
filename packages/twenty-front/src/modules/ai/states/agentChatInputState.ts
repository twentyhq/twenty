import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatInputState = createAtomState<string>({
  key: 'agentChatInputState',
  defaultValue: '',
});
