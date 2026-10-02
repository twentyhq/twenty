import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// Null until loaded, since a thread without its row reads as unread
export const agentChatThreadParticipantsState = createAtomState<Record<
  string,
  AgentChatThreadParticipantFieldsFragment
> | null>({
  key: 'ai/agentChatThreadParticipantsState',
  defaultValue: null,
});
