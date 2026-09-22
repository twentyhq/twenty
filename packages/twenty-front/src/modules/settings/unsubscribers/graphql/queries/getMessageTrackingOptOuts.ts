import { gql } from '@apollo/client';

export const MESSAGE_TRACKING_OPT_OUTS = gql`
  query MessageTrackingOptOuts($input: FindMessageTrackingOptOutsInput!) {
    messageTrackingOptOuts(input: $input) {
      records {
        id
        createdAt
        emailAddress
        source
      }
      totalCount
    }
  }
`;
