import { gql } from '@apollo/client';

export const CREATE_AND_CONNECT_JUNCTION_RECORD = gql`
  mutation CreateAndConnectJunctionRecord(
    $input: CreateAndConnectJunctionRecordInput!
  ) {
    createAndConnectJunctionRecord(input: $input) {
      targetRecord
      junctionRecord
    }
  }
`;
