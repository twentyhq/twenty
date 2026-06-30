import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasAgentChatBeenOpenedState = createAtomState<boolean>({
  key: 'ai/hasAgentChatBeenOpenedState',
  defaultValue: false,
});
