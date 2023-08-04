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
  mutation CreateActivity(
    $activityId: String!
    $body: String
    $title: String
    $type: ActivityType!
    $authorId: String!
    $createdAt: DateTime!
    $activityTargetArray: [ActivityTargetCreateManyActivityInput!]!
  ) {
    createOneActivity(
      data: {
        id: $activityId
        createdAt: $createdAt
        updatedAt: $createdAt
        author: { connect: { id: $authorId } }
        body: $body
        title: $title
        type: $type
        activityTargets: {
          createMany: { data: $activityTargetArray, skipDuplicates: true }
        }
      }
    ) {
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
        commentableType
        commentableId
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
