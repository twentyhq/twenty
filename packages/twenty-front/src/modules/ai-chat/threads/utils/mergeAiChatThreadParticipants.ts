import { isBefore } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const mergeAiChatThreadParticipants = (
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
