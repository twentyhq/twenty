import { gql } from '@apollo/client';

export const GET_AI_SYSTEM_PROMPT_PREVIEW = gql`
  query GetAISystemPromptPreview {
    getAISystemPromptPreview {
      sections {
        title
        content
        estimatedTokenCount
      }
      estimatedTokenCount
    }
  }
`;
