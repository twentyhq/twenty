import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// Rows the server sent, kept so they are not lost before the first page of
// threads brings the member's rows
export const agentChatThreadStreamedParticipantsState = createAtomState<
  Record<string, AgentChatThreadParticipantFieldsFragment>
>({
  key: 'ai/agentChatThreadStreamedParticipantsState',
  defaultValue: {},
});
