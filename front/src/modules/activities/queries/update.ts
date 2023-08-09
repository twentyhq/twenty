import { gql } from '@apollo/client';

export const ADD_ACTIVITY_TARGETS = gql`
  mutation AddActivityTargetsOnActivity(
    $activityId: String!
    $activityTargetInputs: [ActivityTargetCreateManyActivityInput!]!
  ) {
    updateOneActivity(
      where: { id: $activityId }
      data: { activityTargets: { createMany: { data: $activityTargetInputs } } }
    ) {
      id
      createdAt
      updatedAt
      activityTargets {
        id
        createdAt
        updatedAt
        commentableType
        commentableId
        companyId
        personId
      }
    }
  }
`;

export const REMOVE_ACTIVITY_TARGETS = gql`
  mutation RemoveActivityTargetsOnActivity(
    $activityId: String!
    $activityTargetIds: [String!]!
  ) {
    updateOneActivity(
      where: { id: $activityId }
      data: {
        activityTargets: { deleteMany: { id: { in: $activityTargetIds } } }
      }
    ) {
      id
      createdAt
      updatedAt
      activityTargets {
        id
        createdAt
        updatedAt
        commentableType
        commentableId
        companyId
        personId
      }
    }
  }
`;

export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($activityId: String!) {
    deleteManyActivities(where: { id: { equals: $activityId } }) {
      count
    }
  }
`;

export const ACTIVITY_UPDATE_FRAGMENT = gql`
  fragment ActivityUpdateParts on Activity {
    id
    body
    title
    type
    completedAt
    dueAt
    assignee {
      id
      firstName
      lastName
      displayName
    }
  }
`;

export const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity(
    $where: ActivityWhereUniqueInput!
    $data: ActivityUpdateInput!
  ) {
    updateOneActivity(where: $where, data: $data) {
      ...ActivityUpdateParts
    }
  }
`;

export const UPLOAD_ATTACHMENT = gql`
  mutation UploadAttachment($file: Upload!, $activityId: String!) {
    uploadAttachment(file: $file, activityId: $activityId)
  }
`;
