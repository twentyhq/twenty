import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_MANY_CORE_VIEW_GROUPS = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation CreateManyCoreViewGroups($inputs: [CreateViewGroupInput!]!) {
    createManyCoreViewGroups(inputs: $inputs) {
      ...ViewGroupFragment
    }
  }
`;
