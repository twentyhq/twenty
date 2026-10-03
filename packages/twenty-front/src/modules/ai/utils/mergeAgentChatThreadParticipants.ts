import { isBefore } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

// The server sends whole rows, possibly out of order, so a row only replaces
// one it is at least as recent as
export const mergeAgentChatThreadParticipants = (
  participants: Record<string, AgentChatThreadParticipantFieldsFragment>,
  incomingParticipants: AgentChatThreadParticipantFieldsFragment[],
): Record<string, AgentChatThreadParticipantFieldsFragment> =>
  incomingParticipants.reduce((mergedParticipants, incomingParticipant) => {
    const participant = mergedParticipants[incomingParticipant.threadId];

    return isDefined(participant?.updatedAt) &&
      isBefore(incomingParticipant.updatedAt, participant.updatedAt)
      ? mergedParticipants
      : {
          ...mergedParticipants,
          [incomingParticipant.threadId]: incomingParticipant,
        };
  }, participants);
