import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasLoadedAgentChatThreadParticipantsState =
  createAtomState<boolean>({
    key: 'ai/hasLoadedAgentChatThreadParticipantsState',
    defaultValue: false,
  });
