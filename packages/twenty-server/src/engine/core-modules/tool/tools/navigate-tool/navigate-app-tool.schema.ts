import { z } from 'zod';

export const NavigateAppActionZodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z
      .literal('navigateToView')
      .describe(
        'Navigate to a specific view by id. ONLY use this type when the user explicitly mentions the word "view" (e.g. "go to the My Companies view") or right after you created or updated a view. Do NOT use this for general navigation requests.',
      ),
    viewId: z
      .string()
      .uuid()
      .describe(
        'The id of the view to navigate to. Take it from get_views, or from the result of the tool that created or updated the view (e.g. upsert_complete_view, create_view).',
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
  z.object({
    type: z
      .literal('navigateToRecord')
      .describe(
        'Navigate to a specific record page by id. Find the record id first with the find_* tools (e.g. find_many_companies filtered by name), or take it from the result of the tool that created the record. If several records match what the user asked for, ask which one they mean before navigating.',
      ),
    objectNameSingular: z
      .string()
      .describe(
        'The singular name of the object type (e.g. "company", "person", "opportunity")',
      ),
    recordId: z.string().uuid().describe('The id of the record to navigate to'),
  }),
  z.object({
    type: z
      .literal('wait')
      .describe(
        'Wait for a specified duration in milliseconds before continuing. Useful when you need the page to fully load after a navigation before taking further actions (e.g. 2000 for 2 seconds).',
      ),
    durationMs: z
      .number()
      .int()
      .min(0)
      .max(30000)
      .describe(
        'The duration in milliseconds to wait (e.g. 2000 for 2 seconds). Maximum 30000 (30 seconds).',
      ),
  }),
]);

export const NavigateAppInputZodSchema = z.object({
  navigation: NavigateAppActionZodSchema.describe(
    'The navigation action to perform.',
  ),
});

export type NavigateAppAction = z.infer<typeof NavigateAppActionZodSchema>;
export type NavigateAppInput = z.infer<typeof NavigateAppInputZodSchema>;
