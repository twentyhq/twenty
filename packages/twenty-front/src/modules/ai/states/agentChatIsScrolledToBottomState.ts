import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatIsScrolledToBottomState = createAtomState<boolean>({
  key: 'ai/agentChatIsScrolledToBottomState',
  defaultValue: true,
});
