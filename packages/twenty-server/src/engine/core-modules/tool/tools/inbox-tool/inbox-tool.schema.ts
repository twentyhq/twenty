import { z } from 'zod';

import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';

const scalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const InboxItemToolCallDraftZodSchema = z.object({
  toolName: z.string().describe('The tool to call once the person agrees'),
  label: z.string().describe('What the call does, as a short verb phrase'),
  description: z
    .string()
    .describe('One line on why this call is part of the plan')
    .optional(),
  icon: z.string().describe('A Tabler icon name, like IconMail').optional(),
  input: z
    .record(z.string(), scalarSchema)
    .describe(
      'The input the call would run with. The person can edit every field before it runs.',
    ),
  requiredInputKeys: z
    .array(z.string())
    .describe(
      'The input keys the tool cannot run without. The person is not allowed to clear these, and one you left out of the input is asked for.',
    )
    .optional(),
});

export const CreateInboxItemToolInputZodSchema = z.object({
  title: z.string().describe('What the item says in the inbox list, one line'),
  summary: z
    .string()
    .describe('A short second line giving context under the title')
    .optional(),
  typeKey: z
    .string()
    .describe(
      'The kind of work this is, used for its icon and routing. One of: approval, conversation, agent_question, workflow_run_failed, agent_plan.',
    )
    .default('approval'),
  toolCalls: z
    .array(InboxItemToolCallDraftZodSchema)
    .describe(
      'The calls you propose to make. The person reviews, edits or skips each one, then runs the rest in one go. Omit for an item that only asks to be looked at.',
    )
    .optional(),
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
    .nativeEnum(InboxItemPriority)
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
