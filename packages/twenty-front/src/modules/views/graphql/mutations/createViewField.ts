import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const CREATE_VIEW_FIELD = gql`
  ${VIEW_FIELD_FRAGMENT}
  mutation CreateViewField($input: CreateViewFieldInput!) {
    createViewField(input: $input) {
      ...ViewFieldFragment
    }
  }
`;
