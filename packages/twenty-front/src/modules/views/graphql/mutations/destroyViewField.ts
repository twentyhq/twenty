import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const DESTROY_VIEW_FIELD = gql`
  ${VIEW_FIELD_FRAGMENT}
  mutation DestroyViewField($input: DestroyViewFieldInput!) {
    destroyViewField(input: $input) {
      ...ViewFieldFragment
    }
  }
`;
