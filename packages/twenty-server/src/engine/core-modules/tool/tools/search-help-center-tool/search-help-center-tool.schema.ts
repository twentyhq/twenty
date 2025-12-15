import { z } from 'zod';

export const SearchHelpCenterInputZodSchema = z.object({
  query: z
    .string()
    .describe('The search query to find relevant help articles about Twenty'),
});

export const SearchHelpCenterToolParametersZodSchema = z.object({
  loadingMessage: z
    .string()
    .describe(
      'A clear, human-readable status message describing the search being performed. This will be shown to the user while the tool is being called, so phrase it as a present-tense status update (e.g., "Searching help center for..."). Explain what you are searching for in natural language.',
    ),
  input: SearchHelpCenterInputZodSchema,
});

export type SearchHelpCenterInput = z.infer<
  typeof SearchHelpCenterInputZodSchema
>;
