import { gql } from '@apollo/client';

export const GET_VIEW_FIELDS = gql`
  query GetViewFields($where: ViewFieldWhereInput) {
    viewFields: findManyViewField(where: $where) {
      id
      fieldName
      isVisible
      sizeInPx
      index
    }
  }
`;
