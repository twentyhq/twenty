import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_MANY_VIEW_GROUPS = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation CreateManyViewGroups($inputs: [CreateViewGroupInput!]!) {
    createManyViewGroups(inputs: $inputs) {
      ...ViewGroupFragment
    }
  }
`;
