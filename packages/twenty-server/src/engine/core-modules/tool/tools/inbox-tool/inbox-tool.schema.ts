import { z } from 'zod';

export const CreateInboxItemToolInputZodSchema = z.object({
  title: z.string().describe('What the item says in the inbox list, one line'),
  preview: z
    .string()
    .describe('A short second line giving context under the title')
    .optional(),
  typeKey: z
    .string()
    .describe(
      'The kind of work this is, which decides the actions offered on it. One of: approval, conversation, agent_question, workflow_run_failed.',
    )
    .default('approval'),
  queueId: z
    .string()
    .describe(
      'The shared inbox to send this to. Omit to use the workspace routing for this kind of work.',
    )
    .optional(),
  assigneeWorkspaceMemberId: z
    .string()
    .describe(
      'The workspace member this belongs to. Takes precedence over queueId. Omit to leave it unclaimed in a shared inbox.',
    )
    .optional(),
  priority: z
    .enum(['NEEDS_ACTION', 'UPDATE'])
    .describe(
      'How the item sorts. Omit to use the default of its kind of work.',
    )
    .optional(),
  slotKey: z
    .string()
    .describe(
      'An identifier for the piece of work. Two calls naming the same slot fold into one item instead of stacking duplicates. Omit for one item per call.',
    )
    .optional(),
});
