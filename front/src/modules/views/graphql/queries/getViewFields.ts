import { gql } from '@apollo/client';

export const GET_VIEW_FIELDS = gql`
  query GetViewFields(
    $where: ViewFieldWhereInput
    $orderBy: [ViewFieldOrderByWithRelationInput!]
  ) {
    viewFields: findManyViewField(where: $where, orderBy: $orderBy) {
      index
      isVisible
      key
      name
      size
    }
  }
`;
