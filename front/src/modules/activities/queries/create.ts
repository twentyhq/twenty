import { gql } from '@apollo/client';

export const CREATE_COMMENT = gql`
  mutation CreateComment(
    $commentId: String!
    $commentText: String!
    $authorId: String!
    $activityId: String!
    $createdAt: DateTime!
  ) {
    createOneComment(
      data: {
        id: $commentId
        createdAt: $createdAt
        body: $commentText
        author: { connect: { id: $authorId } }
        activity: { connect: { id: $activityId } }
      }
    ) {
      id
      createdAt
      body
      author {
        id
        displayName
        firstName
        lastName
        avatarUrl
      }
      activityId
    }
  }
`;

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
