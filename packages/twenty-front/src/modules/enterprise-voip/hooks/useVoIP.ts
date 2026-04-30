import { gql } from '@apollo/client';

export const CLICK_TO_CALL = gql`
  mutation ClickToCall($input: ClickToCallInput!) {
    clickToCall(input: $input) {
      callId
      status
      fromNumber
      toNumber
      startedAt
    }
  }
`;

export const GET_CALL_ANALYTICS = gql`
  query GetCallAnalytics($dateRange: DateRangeInput, $agentId: ID) {
    callAnalytics(dateRange: $dateRange, agentId: $agentId) {
      totalCalls
      answeredCalls
      missedCalls
      averageDuration
      averageWaitTime
      byDirection {
        direction
        count
        averageDuration
      }
      byHour {
        hour
        count
      }
      byAgent {
        agentId
        agentName
        totalCalls
        answeredCalls
        averageDuration
        averageWaitTime
      }
    }
  }
`;

export const GET_ACTIVE_CALLS = gql`
  query GetActiveCalls {
    activeCalls {
      callId
      status
      direction
      fromNumber
      toNumber
      agentName
      duration
      startedAt
      queueName
    }
  }
`;

export const END_CALL = gql`
  mutation EndCall($callId: ID!) {
    endCall(callId: $callId) {
      callId
      status
      duration
      endedAt
    }
  }
`;
