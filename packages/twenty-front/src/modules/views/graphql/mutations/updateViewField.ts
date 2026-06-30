import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const UPDATE_VIEW_FIELD = gql`
  ${VIEW_FIELD_FRAGMENT}
  mutation UpdateViewField($input: UpdateViewFieldInput!) {
    updateViewField(input: $input) {
      ...ViewFieldFragment
    }
  }
`;
