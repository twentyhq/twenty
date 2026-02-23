import { VIEW_FIELD_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFieldGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_MANY_CORE_VIEW_FIELD_GROUPS = gql`
  ${VIEW_FIELD_GROUP_FRAGMENT}
  mutation CreateManyCoreViewFieldGroups(
    $inputs: [CreateViewFieldGroupInput!]!
  ) {
    createManyCoreViewFieldGroups(inputs: $inputs) {
      ...ViewFieldGroupFragment
    }
  }
`;
