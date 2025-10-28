import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_FIELD = gql`
  ${VIEW_FIELD_FRAGMENT}
  mutation DeleteCoreViewField($input: DeleteViewFieldInput!) {
    deleteCoreViewField(input: $input) {
      ...ViewFieldFragment
    }
  }
`;
