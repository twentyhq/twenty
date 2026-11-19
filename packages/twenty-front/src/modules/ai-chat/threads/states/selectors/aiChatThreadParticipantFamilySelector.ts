import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const aiChatThreadParticipantFamilySelector = createAtomFamilySelector<
  AgentChatThreadParticipantFieldsFragment | undefined,
  string
>({
  key: 'aiChatThreadParticipantFamilySelector',
  get:
    (threadId) =>
    ({ get }) =>
      get(aiChatThreadParticipantsState)?.[threadId],
});
