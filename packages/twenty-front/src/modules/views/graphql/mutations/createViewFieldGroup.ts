import { VIEW_FIELD_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFieldGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_VIEW_FIELD_GROUP = gql`
  ${VIEW_FIELD_GROUP_FRAGMENT}
  mutation CreateViewFieldGroup($input: CreateViewFieldGroupInput!) {
    createViewFieldGroup(input: $input) {
      ...ViewFieldGroupFragment
    }
  }
`;
