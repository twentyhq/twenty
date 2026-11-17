import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const aiChatDisplayedThreadComponentState = createAtomComponentState<
  string | null
>({
  key: 'ai/aiChatDisplayedThreadComponentState',
  defaultValue: null,
  componentInstanceContext: AiChatInstanceContext,
});
