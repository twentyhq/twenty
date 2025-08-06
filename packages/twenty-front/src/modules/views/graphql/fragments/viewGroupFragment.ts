import { gql } from '@apollo/client';

export const VIEW_GROUP_FRAGMENT = gql`
  fragment ViewGroupFragment on ViewGroupDTO {
    id
    fieldMetadataId
    isVisible
    fieldValue
    position
    viewId
    createdAt
    updatedAt
    workspaceId
  }
`;
