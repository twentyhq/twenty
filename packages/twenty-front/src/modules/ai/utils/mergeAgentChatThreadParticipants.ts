import { isBefore } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadParticipant } from '@/ai/types/AgentChatThreadParticipant';

// Rows arrive from loads and from changes, possibly out of order, so a row
// only replaces one it is at least as recent as
export const mergeAgentChatThreadParticipants = (
  participants: Record<string, AgentChatThreadParticipant>,
  incomingParticipants: AgentChatThreadParticipant[],
): Record<string, AgentChatThreadParticipant> =>
  incomingParticipants.reduce((mergedParticipants, incomingParticipant) => {
    const participant = mergedParticipants[incomingParticipant.threadId];

    return isDefined(participant?.updatedAt) &&
      isDefined(incomingParticipant.updatedAt) &&
      isBefore(incomingParticipant.updatedAt, participant.updatedAt)
      ? mergedParticipants
      : {
          ...mergedParticipants,
          [incomingParticipant.threadId]: incomingParticipant,
        };
  }, participants);
