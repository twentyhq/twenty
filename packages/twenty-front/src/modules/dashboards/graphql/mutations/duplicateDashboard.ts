import { gql } from '@apollo/client';

export const DUPLICATE_DASHBOARD = gql`
  mutation DuplicateDashboard($id: UUID!) {
    duplicateDashboard(id: $id) {
      id
      title
      pageLayoutId
      position
      createdAt
      updatedAt
    }
  }
`;
