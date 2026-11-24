import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatReopenedThreadActivityState = createAtomState<
  Record<string, string | null>
>({
  key: 'ai/aiChatReopenedThreadActivityState',
  defaultValue: {},
});
