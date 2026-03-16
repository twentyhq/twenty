import { VIEW_FIELD_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFieldGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_MANY_VIEW_FIELD_GROUPS = gql`
  ${VIEW_FIELD_GROUP_FRAGMENT}
  mutation CreateManyViewFieldGroups($inputs: [CreateViewFieldGroupInput!]!) {
    createManyViewFieldGroups(inputs: $inputs) {
      ...ViewFieldGroupFragment
    }
  }
`;
