import { VIEW_FIELD_GROUP_FRAGMENT } from '@/views/graphql/fragments/viewFieldGroupFragment';
import { gql } from '@apollo/client';

export const CREATE_CORE_VIEW_FIELD_GROUP = gql`
  ${VIEW_FIELD_GROUP_FRAGMENT}
  mutation CreateCoreViewFieldGroup($input: CreateViewFieldGroupInput!) {
    createCoreViewFieldGroup(input: $input) {
      ...ViewFieldGroupFragment
    }
  }
`;
