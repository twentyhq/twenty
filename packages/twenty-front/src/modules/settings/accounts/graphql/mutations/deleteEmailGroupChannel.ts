import { gql } from '@apollo/client';

export const DELETE_EMAIL_GROUP_CHANNEL = gql`
  mutation DeleteEmailGroupChannel($id: UUID!) {
    deleteEmailGroupChannel(id: $id) {
      id
    }
  }
`;
