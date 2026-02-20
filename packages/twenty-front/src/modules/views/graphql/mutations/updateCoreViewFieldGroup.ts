import { VIEW_FIELD_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFieldGroupFragment';
import { gql } from '@apollo/client';

export const UPDATE_CORE_VIEW_FIELD_GROUP = gql`
  ${VIEW_FIELD_GROUP_FRAGMENT}
  mutation UpdateCoreViewFieldGroup($input: UpdateViewFieldGroupInput!) {
    updateCoreViewFieldGroup(input: $input) {
      ...ViewFieldGroupFragment
    }
  }
`;
