import { gql } from '@apollo/client';

export const GET_AI_SYSTEM_PROMPT_PREVIEW = gql`
  query GetAiSystemPromptPreview {
    getAiSystemPromptPreview {
      sections {
        title
        content
        estimatedTokenCount
      }
      estimatedTokenCount
    }
  }
`;
