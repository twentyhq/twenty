import { VIEW_FIELD_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFieldGroupFragment';
import { gql } from '@apollo/client';

export const DELETE_CORE_VIEW_FIELD_GROUP = gql`
  ${VIEW_FIELD_GROUP_FRAGMENT}
  mutation DeleteCoreViewFieldGroup($input: DeleteViewFieldGroupInput!) {
    deleteCoreViewFieldGroup(input: $input) {
      ...ViewFieldGroupFragment
    }
  }
`;
