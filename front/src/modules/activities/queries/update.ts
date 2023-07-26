import { gql } from '@apollo/client';

export const ADD_COMMENT_THREAD_TARGETS = gql`
  mutation AddCommentThreadTargetsOnCommentThread(
    $commentThreadId: String!
    $commentThreadTargetInputs: [CommentThreadTargetCreateManyCommentThreadInput!]!
  ) {
    updateOneCommentThread(
      where: { id: $commentThreadId }
      data: {
        commentThreadTargets: {
          createMany: { data: $commentThreadTargetInputs }
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

export const REMOVE_COMMENT_THREAD_TARGETS = gql`
  mutation RemoveCommentThreadTargetsOnCommentThread(
    $commentThreadId: String!
    $commentThreadTargetIds: [String!]!
  ) {
    updateOneCommentThread(
      where: { id: $commentThreadId }
      data: {
        commentThreadTargets: {
          deleteMany: { id: { in: $commentThreadTargetIds } }
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
    $completedAt: DateTime
  ) {
    updateOneCommentThread(
      where: { id: $id }
      data: {
        body: $body
        title: $title
        type: $type
        completedAt: $completedAt
      }
    ) {
      id
      body
      title
      type
      completedAt
    }
  }
`;

export const UPLOAD_ATTACHMENT = gql`
  mutation UploadAttachment($file: Upload!, $activityId: String!) {
    uploadAttachment(file: $file, activityId: $activityId)
  }
`;
