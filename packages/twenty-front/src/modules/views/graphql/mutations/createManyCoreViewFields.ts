import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const CREATE_MANY_CORE_VIEW_FIELDS = gql`
  ${VIEW_FIELD_FRAGMENT}
  mutation CreateManyCoreViewFields($inputs: [CreateViewFieldInput!]!) {
    createManyCoreViewFields(inputs: $inputs) {
      ...ViewFieldFragment
    }
  }
`;
