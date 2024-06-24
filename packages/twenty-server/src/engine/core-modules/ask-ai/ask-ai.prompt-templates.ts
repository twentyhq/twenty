import { PromptTemplate } from '@langchain/core/prompts';

// TODO: Add field metadata to prompt?
export const sqlGenerationPromptTemplate = PromptTemplate.fromTemplate<{
  llmOutputJsonSchema: string;
  sqlCreateTableStatements: string;
  userQuestion: string;
}>(`Always respond following this JSON Schema: {llmOutputJsonSchema}

Based on the table schema below, write a PostgreSQL query that would answer the user's question. All column names must be enclosed in double quotes.

{sqlCreateTableStatements}

Question: {userQuestion}
SQL Query:`);
