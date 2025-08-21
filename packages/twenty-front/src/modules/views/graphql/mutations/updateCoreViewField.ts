import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const UPDATE_CORE_VIEW_FIELD = gql`
  ${VIEW_FIELD_FRAGMENT}
  mutation UpdateCoreViewField($id: String!, $input: UpdateViewFieldInput!) {
    updateCoreViewField(id: $id, input: $input) {
      ...ViewFieldFragment
    }
  }
`;
