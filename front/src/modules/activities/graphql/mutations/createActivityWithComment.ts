import { gql } from '@apollo/client';

export const CREATE_ACTIVITY_WITH_COMMENT = gql`
  mutation CreateActivity($data: ActivityCreateInput!) {
    createOneActivity(data: $data) {
      id
      createdAt
      updatedAt
      authorId
      type
      activityTargets {
        id
        createdAt
        updatedAt
        activityId
        companyId
        personId
      }
      comments {
        id
        createdAt
        updatedAt
        body
        author {
          id
        }
      }
    }
  }
`;
