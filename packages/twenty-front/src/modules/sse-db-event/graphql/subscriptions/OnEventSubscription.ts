import { gql } from '@apollo/client';

export const ON_EVENT_SUBSCRIPTION = gql`
  subscription OnEventSubscription($eventStreamId: String!) {
    onEventSubscription(eventStreamId: $eventStreamId) {
      eventStreamId
      eventWithQueryIdsList {
        event {
          action
          objectNameSingular
          recordId
          userId
          workspaceMemberId
          properties {
            updatedFields
            before
            after
            diff
          }
        }
        queryIds
      }
    }
  }
`;
