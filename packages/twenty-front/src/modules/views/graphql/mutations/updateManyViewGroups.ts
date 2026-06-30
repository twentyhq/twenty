import { VIEW_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewGroupFragment';
import { gql } from '@apollo/client';

export const UPDATE_MANY_VIEW_GROUPS = gql`
  ${VIEW_GROUP_FRAGMENT}
  mutation UpdateManyViewGroups($inputs: [UpdateViewGroupInput!]!) {
    updateManyViewGroups(inputs: $inputs) {
      ...ViewGroupFragment
    }
  }
`;
