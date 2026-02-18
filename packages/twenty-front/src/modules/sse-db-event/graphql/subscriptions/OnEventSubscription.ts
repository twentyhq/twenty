import { gql } from '@apollo/client';

export const ON_EVENT_SUBSCRIPTION = gql`
  subscription OnEventSubscription($eventStreamId: String!) {
    onEventSubscription(eventStreamId: $eventStreamId) {
      eventStreamId
      objectRecordEventsWithQueryIds {
        objectRecordEvent {
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
      metadataEventsWithQueryIds {
        metadataEvent {
          type
          metadataName
          recordId
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
