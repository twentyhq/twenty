import { gql } from '@apollo/client';

const INBOX_QUEUE_SETTINGS_FRAGMENT = gql`
  fragment InboxQueueSettingsFields on InboxQueueSettings {
    id
    name
    label
    icon
    isDefault
    roleIds
  }
`;

export const GET_INBOX_QUEUE_SETTINGS = gql`
  ${INBOX_QUEUE_SETTINGS_FRAGMENT}
  query GetInboxQueueSettings {
    inboxQueueSettings {
      ...InboxQueueSettingsFields
    }
  }
`;

export const CREATE_INBOX_QUEUE = gql`
  ${INBOX_QUEUE_SETTINGS_FRAGMENT}
  mutation CreateInboxQueue($input: CreateInboxQueueInput!) {
    createInboxQueue(input: $input) {
      ...InboxQueueSettingsFields
    }
  }
`;

export const UPDATE_INBOX_QUEUE = gql`
  ${INBOX_QUEUE_SETTINGS_FRAGMENT}
  mutation UpdateInboxQueue($input: UpdateInboxQueueInput!) {
    updateInboxQueue(input: $input) {
      ...InboxQueueSettingsFields
    }
  }
`;

export const SET_INBOX_QUEUE_ROLES = gql`
  ${INBOX_QUEUE_SETTINGS_FRAGMENT}
  mutation SetInboxQueueRoles($input: SetInboxQueueRolesInput!) {
    setInboxQueueRoles(input: $input) {
      ...InboxQueueSettingsFields
    }
  }
`;

export const DELETE_INBOX_QUEUE = gql`
  mutation DeleteInboxQueue($queueId: UUID!) {
    deleteInboxQueue(queueId: $queueId)
  }
`;
