import { gql } from '@apollo/client';

export const AGENT_CHAT_CHANNEL_FRAGMENT = gql`
  fragment AgentChatChannelFragment on AgentChatChannel {
    id
    name
    visibility
    targetObjectMetadataId
    targetRecordId
    createdByUserWorkspaceId
    createdAt
    updatedAt
  }
`;

export const AGENT_CHAT_CHANNEL_MEMBER_FRAGMENT = gql`
  fragment AgentChatChannelMemberFragment on AgentChatChannelMember {
    id
    channelId
    userWorkspaceId
    role
    createdAt
  }
`;
