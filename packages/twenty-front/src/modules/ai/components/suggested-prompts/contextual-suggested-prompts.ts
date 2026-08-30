import { msg } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import {
  IconCheckbox,
  IconFilter,
  IconMail,
  IconNotes,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconTerminal,
} from 'twenty-ui/icon';

import { type SuggestedPrompt } from '@/ai/types/SuggestedPrompt';

export const LIST_VIEW_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'summarize-view',
    label: msg`Summarize this view`,
    Icon: IconSparkles,
    mode: 'SEND',
    prompts: [
      msg`Summarize the records in this view and point out anything that needs attention.`,
    ],
  },
  {
    id: 'filter-view',
    label: msg`Filter this view`,
    Icon: IconFilter,
    prompts: [msg`Filter this view to only show `],
  },
  {
    id: 'create-record-in-view',
    label: msg`Create a record`,
    Icon: IconPlus,
    prompts: [msg`Create a new record in this view. Details: `],
  },
];

export const RECORD_PAGE_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'summarize-record',
    label: msg`Summarize this record`,
    Icon: IconSparkles,
    mode: 'SEND',
    prompts: [msg`Summarize this record and its recent activity.`],
  },
  {
    id: 'add-note-to-record',
    label: msg`Add a note`,
    Icon: IconNotes,
    prompts: [msg`Add a note to this record: `],
  },
  {
    id: 'create-task-for-record',
    label: msg`Create a task`,
    Icon: IconCheckbox,
    prompts: [msg`Create a task for this record: `],
  },
];

// Only objects whose record page deserves its own wording need an entry: everything
// else, custom objects included, falls back to RECORD_PAGE_SUGGESTED_PROMPTS.
export const RECORD_PAGE_SUGGESTED_PROMPTS_BY_OBJECT_NAME_SINGULAR: Record<
  string,
  SuggestedPrompt[]
> = {
  [CoreObjectNameSingular.Workflow]: [
    {
      id: 'explain-workflow',
      label: msg`Explain this workflow`,
      Icon: IconSparkles,
      mode: 'SEND',
      prompts: [msg`Explain what this workflow does, step by step.`],
    },
    {
      id: 'add-workflow-step',
      label: msg`Add a step`,
      Icon: IconPlus,
      prompts: [msg`Add a step to this workflow that `],
    },
    {
      id: 'check-workflow-runs',
      label: msg`Check recent runs`,
      Icon: IconTerminal,
      mode: 'SEND',
      prompts: [
        msg`Check this workflow's recent runs and tell me whether any failed and why.`,
      ],
    },
  ],
  [CoreObjectNameSingular.Company]: [
    {
      id: 'research-company',
      label: msg`Research this company`,
      Icon: IconSearch,
      mode: 'SEND',
      prompts: [
        msg`Research this company and summarize what they do, how big they are and any recent news.`,
      ],
    },
    {
      id: 'draft-company-email',
      label: msg`Draft an email`,
      Icon: IconMail,
      prompts: [msg`Draft an email to this company about `],
    },
    {
      id: 'create-task-for-company',
      label: msg`Create a task`,
      Icon: IconCheckbox,
      prompts: [msg`Create a task for this company: `],
    },
  ],
};
