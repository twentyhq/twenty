import { gql } from '@apollo/client';

export type CreateAiAgentConfigInput = {
  workspaceId: string;
  agent: string;
  fieldMetadataId: string;
  objectMetadataId: string;
  wipLimit: number;
  additionalInput: string;
  viewGroupId: string;
  viewId: string;
  status: 'ENABLED' | 'DISABLED';
};

export type UpdateAiAgentConfigInput = {
  objectMetadataId?: string;
  viewId?: string;
  fieldMetadataId?: string;
  viewGroupId?: string;
  agent?: string;
  wipLimit?: number;
  additionalInput?: string;
  status?: 'ENABLED' | 'DISABLED';
};

export type CreateAiAgentConfigResponse = {
  id: string;
};

export const CREATE_AI_AGENT_CONFIG = gql`
  mutation createAiAgentConfig($input: CreateAiAgentConfigInput!) {
    createAiAgentConfig(input: $input) {
      id
    }
  }
`;

export const UPDATE_AI_AGENT_CONFIG = gql`
  mutation updateAiAgentConfig($id: String!, $input: UpdateAiAgentConfigInput!) {
    updateAiAgentConfig(id: $id, input: $input) {
      id
      workspaceId
      objectMetadataId
      viewId
      fieldMetadataId
      viewGroupId
      agent
      wipLimit
      additionalInput
      status
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_AI_AGENT_CONFIG = gql`
  mutation deleteAiAgentConfig($id: String!) {
    deleteAiAgentConfig(id: $id)
  }
`;

export type AiAgentConfigFilter = {
  objectMetadataId?: string;
  fieldMetadataId?: string;
  viewGroupId?: string;
  viewId?: string;
  agent?: string;
  status?: 'ENABLED' | 'DISABLED';
};

export type AiAgentConfig = {
  id: string;
  workspaceId: string;
  objectMetadataId: string;
  viewId: string;
  fieldMetadataId: string;
  viewGroupId: string;
  agent: string;
  wipLimit: number;
  additionalInput: string;
  status: 'ENABLED' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export const GET_AI_AGENT_CONFIG = gql`
  query aiAgentConfig($filter: AiAgentConfigFilterInput!) {
    aiAgentConfig(filter: $filter) {
      id
      workspaceId
      objectMetadataId
      viewId
      fieldMetadataId
      viewGroupId
      agent
      wipLimit
      additionalInput
      status
      createdAt
      updatedAt
      deletedAt
    }
  }
`; 