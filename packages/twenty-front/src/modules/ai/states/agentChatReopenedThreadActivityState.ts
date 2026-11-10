import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The lastActivityAt of each thread the member moved back to the inbox, as it
// was then: such a chat is not filed on leave until something new happens in it
export const agentChatReopenedThreadActivityState = createAtomState<
  Record<string, string | null>
>({
  key: 'ai/agentChatReopenedThreadActivityState',
  defaultValue: {},
});
