import { gql } from '@apollo/client';

import { participantFragment } from '@/activities/emails/graphql/queries/fragments/participantFragment';

export const timelineThreadFragment = gql`
  fragment TimelineThreadFragment on TimelineThread {
    id
    read
    visibility
    firstParticipant {
      ...ParticipantFragment
    }
    lastTwoParticipants {
      ...ParticipantFragment
    }
    lastMessageReceivedAt
    lastMessageBody
    subject
    numberOfMessagesInThread
    participantCount
  }
  ${participantFragment}
`;
