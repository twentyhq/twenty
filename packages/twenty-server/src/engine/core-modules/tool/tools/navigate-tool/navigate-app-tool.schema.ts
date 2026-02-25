import { z } from 'zod';

export const NavigateAppInputZodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('navigateToView').describe('Navigate to a specific view'),
    viewName: z
      .string()
      .describe(
        'The name of the view to navigate to (e.g. "My Companies", "All People")',
      ),
  }),
  z.object({
    type: z
      .literal('navigateToObject')
      .describe('Navigate to the default view for an object'),
    objectNameSingular: z
      .string()
      .describe(
        'The singular name of the object to navigate to (e.g. "company", "person", "opportunity")',
      ),
  }),
]);

export type NavigateAppInput = z.infer<typeof NavigateAppInputZodSchema>;
