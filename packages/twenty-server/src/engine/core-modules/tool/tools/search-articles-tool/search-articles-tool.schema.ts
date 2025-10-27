import { z } from 'zod';

export const SearchArticlesInputZodSchema = z.object({
  query: z
    .string()
    .describe('The search query to find relevant help articles about Twenty'),
});

export const SearchArticlesToolParametersZodSchema = z.object({
  loadingMessage: z
    .string()
    .describe(
      'A clear, human-readable status message describing the search being performed. This will be shown to the user while the tool is being called, so phrase it as a present-tense status update (e.g., "Searching help articles for..."). Explain what you are searching for in natural language.',
    ),
  input: SearchArticlesInputZodSchema,
});

export type SearchArticlesInput = z.infer<typeof SearchArticlesInputZodSchema>;
