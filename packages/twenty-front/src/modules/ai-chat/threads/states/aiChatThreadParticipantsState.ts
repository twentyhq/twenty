import { type AiChatThreadParticipants } from '@/ai-chat/threads/types/AiChatThreadParticipants';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatThreadParticipantsState =
  createAtomState<AiChatThreadParticipants>({
    key: 'ai/aiChatThreadParticipantsState',
    defaultValue: { isLoaded: false, rowsByThreadId: {} },
  });
