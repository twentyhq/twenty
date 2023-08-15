import { gql } from '@apollo/client';

export const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity(
    $where: ActivityWhereUniqueInput!
    $data: ActivityUpdateInput!
  ) {
    updateOneActivity(where: $where, data: $data) {
      ...ActivityUpdateParts
    }
  }
`;
