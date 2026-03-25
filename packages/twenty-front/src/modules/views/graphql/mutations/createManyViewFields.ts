import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const CREATE_MANY_VIEW_FIELDS = gql`
  ${VIEW_FIELD_FRAGMENT}
  mutation CreateManyViewFields($inputs: [CreateViewFieldInput!]!) {
    createManyViewFields(inputs: $inputs) {
      ...ViewFieldFragment
    }
  }
`;
