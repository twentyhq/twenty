import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const agentChatUiMessagesState = createAtomState<ExtendedUIMessage[]>({
  key: 'agentChatUiMessagesState',
  defaultValue: [],
});
