import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const closingAiChatInboxThreadIdState = createAtomState<string | null>({
  key: 'ai/closingAiChatInboxThreadIdState',
  defaultValue: null,
});
