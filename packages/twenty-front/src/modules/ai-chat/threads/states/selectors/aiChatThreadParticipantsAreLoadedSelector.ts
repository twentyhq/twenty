import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatThreadParticipantsAreLoadedSelector =
  createAtomSelector<boolean>({
    key: 'aiChatThreadParticipantsAreLoadedSelector',
    get: ({ get }) => get(aiChatThreadParticipantsState).isLoaded,
  });
