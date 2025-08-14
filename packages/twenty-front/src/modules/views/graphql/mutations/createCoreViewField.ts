import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const CREATE_CORE_VIEW_FIELD = gql`
  ${VIEW_FIELD_FRAGMENT}
  mutation CreateCoreViewField($input: CreateViewFieldInput!) {
    createCoreViewField(input: $input) {
      ...ViewFieldFragment
    }
  }
`;
