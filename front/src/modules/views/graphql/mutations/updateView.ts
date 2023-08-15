import { gql } from '@apollo/client';

export const UPDATE_VIEW = gql`
  mutation UpdateView($data: ViewUpdateInput!, $where: ViewWhereUniqueInput!) {
    updateOneView(data: $data, where: $where) {
      id
      name
    }
  }
`;
