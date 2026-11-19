import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const areAiChatThreadParticipantsLoadedSelector =
  createAtomSelector<boolean>({
    key: 'areAiChatThreadParticipantsLoadedSelector',
    get: ({ get }) => isDefined(get(aiChatThreadParticipantsState)),
  });
