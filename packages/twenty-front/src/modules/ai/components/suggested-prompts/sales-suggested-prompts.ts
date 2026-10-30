import { msg } from '@lingui/core/macro';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconTargetArrow,
} from 'twenty-ui/icon';

import { type SuggestedPrompt } from '@/ai/types/SuggestedPrompt';

// Starting points for a sales rep in a chat-first workspace. They only fill
// in or send an ordinary chat message; none of them is a separate feature.
export const SALES_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'meeting-brief',
    label: msg`Prepare a meeting brief`,
    Icon: IconCalendarEvent,
    prompts: [
      msg`Prepare me for my next meeting with `,
      msg`Brief me on this account before my call: open opportunities, recent notes, key people, and what we still don't know. Account: `,
    ],
  },
  {
    id: 'stalled-deals',
    label: msg`Explain stalled deals`,
    Icon: IconTargetArrow,
    mode: 'SEND',
    prompts: [
      msg`Which open opportunities look stalled, and why? Separate facts from guesses and suggest a next step for each.`,
    ],
  },
  {
    id: 'follow-up',
    label: msg`Draft a follow-up`,
    Icon: IconMail,
    prompts: [
      msg`Draft a follow-up email to `,
      msg`Help me write a short follow-up after my last meeting with `,
    ],
  },
  {
    id: 'account-overview',
    label: msg`Review my accounts`,
    Icon: IconBuildingSkyscraper,
    mode: 'SEND',
    prompts: [
      msg`Summarize my open pipeline by stage in a table, with the total amount and the biggest deal in each stage.`,
    ],
  },
];
