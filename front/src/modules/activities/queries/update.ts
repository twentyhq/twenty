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

export const UPDATE_COMMENT_THREAD = gql`
  mutation UpdateCommentThread(
    $id: String!
    $body: String
    $title: String
    $type: ActivityType
  ) {
    updateOneCommentThread(
      where: { id: $id }
      data: { body: $body, title: $title, type: $type }
    ) {
      id
      body
      title
      type
    }
  }
`;

export const UPLOAD_ATTACHMENT = gql`
  mutation UploadAttachment($file: Upload!, $activityId: String!) {
    uploadAttachment(file: $file, activityId: $activityId)
  }
`;
