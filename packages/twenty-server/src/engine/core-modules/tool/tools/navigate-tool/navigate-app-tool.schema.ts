import { z } from 'zod';

export const NavigateAppInputZodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z
      .literal('navigateToView')
      .describe(
        'Navigate to a specific view by name. ONLY use this type when the user explicitly mentions the word "view" (e.g. "go to the My Companies view", "open view All People"). Do NOT use this for general navigation requests.',
      ),
    viewName: z
      .string()
      .describe(
        'The name of the view to navigate to (e.g. "My Companies", "All People")',
      ),
  }),
  z.object({
    type: z
      .literal('navigateToObject')
      .describe(
        'Navigate to the default view for an object. This is the PREFERRED and DEFAULT type for all navigation requests unless the user explicitly mentions the word "view".',
      ),
    objectNameSingular: z
      .string()
      .describe(
        'The singular name of the object to navigate to (e.g. "company", "person", "opportunity")',
      ),
  }),
]);

export type NavigateAppInput = z.infer<typeof NavigateAppInputZodSchema>;
