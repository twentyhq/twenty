import { gql } from '@apollo/client';

const INBOX_QUEUE_SETTINGS_FRAGMENT = gql`
  fragment InboxQueueSettingsFields on InboxQueueSettings {
    id
    name
    slug
    icon
    isDefault
    memberUserWorkspaceIds
  }
`;

const INBOX_ITEM_TYPE_SETTINGS_FRAGMENT = gql`
  fragment InboxItemTypeSettingsFields on InboxItemTypeSettings {
    id
    key
    label
    icon
    defaultQueueId
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

export const GET_INBOX_ITEM_TYPE_SETTINGS = gql`
  ${INBOX_ITEM_TYPE_SETTINGS_FRAGMENT}
  query GetInboxItemTypeSettings {
    inboxItemTypeSettings {
      ...InboxItemTypeSettingsFields
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

export const SET_INBOX_QUEUE_MEMBERS = gql`
  ${INBOX_QUEUE_SETTINGS_FRAGMENT}
  mutation SetInboxQueueMembers($input: SetInboxQueueMembersInput!) {
    setInboxQueueMembers(input: $input) {
      ...InboxQueueSettingsFields
    }
  }
`;

export const DELETE_INBOX_QUEUE = gql`
  mutation DeleteInboxQueue($queueId: UUID!) {
    deleteInboxQueue(queueId: $queueId)
  }
`;

export const SET_INBOX_ITEM_TYPE_DEFAULT_QUEUE = gql`
  ${INBOX_ITEM_TYPE_SETTINGS_FRAGMENT}
  mutation SetInboxItemTypeDefaultQueue(
    $input: SetInboxItemTypeDefaultQueueInput!
  ) {
    setInboxItemTypeDefaultQueue(input: $input) {
      ...InboxItemTypeSettingsFields
    }
  }
`;
