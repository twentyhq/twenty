import { gql } from '@apollo/client';

export const CREATE_COMMENT = gql`
  mutation CreateComment(
    $commentId: String!
    $commentText: String!
    $authorId: String!
    $commentThreadId: String!
    $createdAt: DateTime!
  ) {
    createOneComment(
      data: {
        id: $commentId
        createdAt: $createdAt
        body: $commentText
        author: { connect: { id: $authorId } }
        commentThread: { connect: { id: $commentThreadId } }
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
      commentThreadId
    }
  }
`;

export const CREATE_COMMENT_THREAD_WITH_COMMENT = gql`
  mutation CreateCommentThread(
    $commentThreadId: String!
    $body: String
    $title: String
    $type: ActivityType!
    $authorId: String!
    $createdAt: DateTime!
    $commentThreadTargetArray: [CommentThreadTargetCreateManyCommentThreadInput!]!
  ) {
    createOneCommentThread(
      data: {
        id: $commentThreadId
        createdAt: $createdAt
        updatedAt: $createdAt
        author: { connect: { id: $authorId } }
        body: $body
        title: $title
        type: $type
        commentThreadTargets: {
          createMany: { data: $commentThreadTargetArray, skipDuplicates: true }
        }
      }
    ) {
      id
      createdAt
      updatedAt
      authorId
      type
      commentThreadTargets {
        id
        createdAt
        updatedAt
        commentThreadId
        commentableType
        commentableId
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
