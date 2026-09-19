import { z } from 'zod';

import { InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';

// A tool's input nests more often than not, so a value is any JSON rather
// than a scalar.
const inputValueSchema: z.ZodType<unknown> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.record(
    z.string(),
    z.lazy(() => inputValueSchema),
  ),
  z.array(z.lazy(() => inputValueSchema)),
]);

export const InboxItemToolCallDraftZodSchema = z.object({
  toolName: z.string().describe('The tool to call once the person agrees'),
  label: z.string().describe('What the call does, as a short verb phrase'),
  description: z
    .string()
    .describe('One line on why this call is part of the plan')
    .optional(),
  icon: z.string().describe('A Tabler icon name, like IconMail').optional(),
  input: z
    .record(z.string(), inputValueSchema)
    .describe(
      'The input the call would run with. The person can edit every field before it runs.',
    ),
  requiredInputKeys: z
    .array(z.string())
    .describe(
      'The input keys the tool cannot run without. The person is not allowed to clear these, and one you left out of the input is asked for.',
    )
    .optional(),
  inputFieldTypes: z
    .record(z.string(), z.nativeEnum(InboxItemFieldType))
    .describe(
      'The type of any key you left out of the input, so the person gets the editor the tool expects rather than a text box. Keys you did give a value for are read off that value.',
    )
    .optional(),
});

export const CreateInboxItemToolInputZodSchema = z.object({
  title: z.string().describe('What the item says in the inbox list, one line'),
  summary: z
    .string()
    .describe('A short second line giving context under the title')
    .optional(),
  icon: z
    .string()
    .describe(
      'A Tabler icon name for the item, such as IconCircleCheck for an approval or IconBell for a notice. Omit to let the inbox pick one from what the item is about.',
    )
    .optional(),
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
