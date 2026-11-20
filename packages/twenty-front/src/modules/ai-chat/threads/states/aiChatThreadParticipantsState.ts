import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// Null until loaded, since a thread without its row reads as unread
export const aiChatThreadParticipantsState = createAtomState<Record<
  string,
  AgentChatThreadParticipantFieldsFragment
> | null>({
  key: 'ai/aiChatThreadParticipantsState',
  defaultValue: null,
});
