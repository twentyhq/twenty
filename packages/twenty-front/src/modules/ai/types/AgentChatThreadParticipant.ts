import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// A row created optimistically carries only the fields the change touched
export type AgentChatThreadParticipant = Pick<
  AgentChatThreadParticipantFieldsFragment,
  'threadId'
> &
  Partial<Omit<AgentChatThreadParticipantFieldsFragment, 'threadId'>>;
