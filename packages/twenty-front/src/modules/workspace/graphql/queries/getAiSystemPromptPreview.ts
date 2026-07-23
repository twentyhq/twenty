import { gql } from '@apollo/client';

export const GET_AI_SYSTEM_PROMPT_PREVIEW = gql`
  query GetAiSystemPromptPreview($companyContext: JSON) {
    getAiSystemPromptPreview(companyContext: $companyContext) {
      sections {
        title
        content
        estimatedTokenCount
      }
      estimatedTokenCount
    }
  }
`;
