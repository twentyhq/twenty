import { gql } from '@apollo/client';

export const GET_ALL_TELEPHONYS = gql`
  query GetAllTelephonys($workspaceId: ID!) {
    findAllTelephony(workspaceId: $workspaceId) {
      id
      memberId
      numberExtension
      workspace {
        id
      }
      createdAt
      updatedAt
      SIPPassword
      areaCode
      blockExtension
      callerExternalID
      destinyMailboxAllCallsOrOffline
      destinyMailboxBusy
      dialingPlan
      emailForMailbox
      enableMailbox
      extensionAllCallsOrOffline
      extensionBusy
      extensionGroup
      extensionName
      externalNumberAllCallsOrOffline
      externalNumberBusy
      fowardAllCalls
      fowardBusyNotAvailable
      fowardOfflineWithoutService
      listenToCalls
      pullCalls
      recordCalls
      type
      advancedFowarding1
      advancedFowarding2
      advancedFowarding3
      advancedFowarding4
      advancedFowarding5
      advancedFowarding1Value
      advancedFowarding2Value
      advancedFowarding3Value
      advancedFowarding4Value
      advancedFowarding5Value
    }
  }
`;
