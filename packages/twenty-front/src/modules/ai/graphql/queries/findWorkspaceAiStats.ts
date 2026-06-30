import { gql } from '@apollo/client';

export const FIND_WORKSPACE_AI_STATS = gql`
  query FindWorkspaceAiStats {
    findWorkspaceAiStats {
      conversationsCount
      skillsCount
      toolsCount
    }
  }
`;
