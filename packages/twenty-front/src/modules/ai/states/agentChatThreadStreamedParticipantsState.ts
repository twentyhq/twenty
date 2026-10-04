import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// Rows the server sent since the member's rows were last requested, kept so
// the response cannot undo a change that came after it was read
export const agentChatThreadStreamedParticipantsState = createAtomState<
  Record<string, AgentChatThreadParticipantFieldsFragment>
>({
  key: 'ai/agentChatThreadStreamedParticipantsState',
  defaultValue: {},
});
