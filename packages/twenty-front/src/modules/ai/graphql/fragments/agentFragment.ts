import { gql } from '@apollo/client';

export const AGENT_FRAGMENT = gql`
  fragment AgentFields on Agent {
    id
    name
    label
    description
    icon
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
