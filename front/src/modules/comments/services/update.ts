import { gql } from '@apollo/client';

export const ADD_COMMENT_THREAD_TARGET = gql`
  mutation AddCommentThreadTargetOnCommentThread(
    $commentThreadId: String!
    $commentThreadTargetCreationDate: DateTime!
    $commentThreadTargetId: String!
    $commentableEntityId: String!
    $commentableEntityType: CommentableType!
  ) {
    updateOneCommentThread(
      where: { id: $commentThreadId }
      data: {
        commentThreadTargets: {
          connectOrCreate: {
            create: {
              id: $commentThreadTargetId
              createdAt: $commentThreadTargetCreationDate
              commentableType: $commentableEntityType
              commentableId: $commentableEntityId
            }
            where: { id: $commentThreadTargetId }
          }
        }
      }
    ) {
      id
      createdAt
      updatedAt
      commentThreadTargets {
        id
        createdAt
        updatedAt
        commentableType
        commentableId
      }
    }
  }
`;

export const REMOVE_COMMENT_THREAD_TARGET = gql`
  mutation RemoveCommentThreadTargetOnCommentThread(
    $commentThreadId: String!
    $commentThreadTargetId: String!
  ) {
    updateOneCommentThread(
      where: { id: $commentThreadId }
      data: { commentThreadTargets: { delete: { id: $commentThreadTargetId } } }
    ) {
      id
      createdAt
      updatedAt
      commentThreadTargets {
        id
        createdAt
        updatedAt
        commentableType
        commentableId
      }
    }
  }
`;

export const DELETE_COMMENT_THREAD = gql`
  mutation DeleteCommentThread($commentThreadId: String!) {
    deleteManyCommentThreads(where: { id: { equals: $commentThreadId } }) {
      count
    }
  }
`;

export const UPDATE_COMMENT_THREAD_TITLE = gql`
  mutation UpdateCommentThreadTitle(
    $commentThreadId: String!
    $commentThreadTitle: String
  ) {
    updateOneCommentThread(
      where: { id: $commentThreadId }
      data: { title: { set: $commentThreadTitle } }
    ) {
      id
      title
    }
  }
`;

export const UPDATE_COMMENT_THREAD_BODY = gql`
  mutation UpdateCommentThreadBody(
    $commentThreadId: String!
    $commentThreadBody: String
  ) {
    updateOneCommentThread(
      where: { id: $commentThreadId }
      data: { body: { set: $commentThreadBody } }
    ) {
      id
      body
    }
  }
`;
