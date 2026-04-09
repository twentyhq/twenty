import { VIEW_FIELD_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFieldGroupFragment';
import { gql } from '@apollo/client';

export const DELETE_VIEW_FIELD_GROUP = gql`
  ${VIEW_FIELD_GROUP_FRAGMENT}
  mutation DeleteViewFieldGroup($input: DeleteViewFieldGroupInput!) {
    deleteViewFieldGroup(input: $input) {
      ...ViewFieldGroupFragment
    }
  }
`;
