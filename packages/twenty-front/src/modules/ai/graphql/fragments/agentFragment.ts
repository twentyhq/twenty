import { gql } from '@apollo/client';

export const AGENT_FRAGMENT = gql`
  fragment AgentFields on Agent {
    id
    universalIdentifier
    name
    label
    description
    icon
    avatarColor
    avatarShape
    prompt
    modelId
    responseFormat
    roleId
    isSystem
    isActive
    modelConfiguration
    triggers
    applicationId
    createdAt
    updatedAt
  }
`;
