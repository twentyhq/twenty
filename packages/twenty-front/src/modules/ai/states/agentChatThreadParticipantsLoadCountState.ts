import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Loads can overlap, and only the one requested last may replace the rows
export const agentChatThreadParticipantsLoadCountState =
  createAtomState<number>({
    key: 'ai/agentChatThreadParticipantsLoadCountState',
    defaultValue: 0,
  });
