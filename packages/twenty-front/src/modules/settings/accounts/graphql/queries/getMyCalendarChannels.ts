import { gql } from '@apollo/client';

export const GET_MY_CALENDAR_CHANNELS = gql`
  query MyCalendarChannels($connectedAccountId: UUID) {
    myCalendarChannels(connectedAccountId: $connectedAccountId) {
      id
      handle
      visibility
      syncStatus
      syncStage
      syncStageStartedAt
      isContactAutoCreationEnabled
      contactAutoCreationPolicy
      isSyncEnabled
      connectedAccountId
      createdAt
      updatedAt
    }
  }
`;
