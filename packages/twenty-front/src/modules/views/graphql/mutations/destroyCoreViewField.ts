import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const DESTROY_CORE_VIEW_FIELD = gql`
  ${VIEW_FIELD_FRAGMENT}
  mutation DestroyCoreViewField($input: DestroyViewFieldInput!) {
    destroyCoreViewField(input: $input) {
      ...ViewFieldFragment
    }
  }
`;
