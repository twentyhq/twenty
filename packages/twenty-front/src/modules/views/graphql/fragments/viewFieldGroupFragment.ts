import { VIEW_FIELD_FRAGMENT } from '@/views/graphql/fragments/viewFieldFragment';
import { gql } from '@apollo/client';

export const VIEW_FIELD_GROUP_FRAGMENT = gql`
  ${VIEW_FIELD_FRAGMENT}
  fragment ViewFieldGroupFragment on CoreViewFieldGroup {
    id
    name
    position
    isVisible
    viewId
    createdAt
    updatedAt
    deletedAt
    viewFields {
      ...ViewFieldFragment
    }
  }
`;
