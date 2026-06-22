import { defineSkill } from 'twenty-sdk/define';

import { TICKET_TRIAGE_SKILL_ID } from 'src/constants/universal-identifiers';

export default defineSkill({
  universalIdentifier: TICKET_TRIAGE_SKILL_ID,
  name: 'ticket-triage',
  label: 'Ticket Triage',
  description:
    'Classify and prioritize incoming support tickets by urgency, category, and suggested assignee.',
  icon: 'IconTicket',
  content: `You are a support ticket triage specialist. When reviewing a ticket:
1. Determine urgency based on impact (blocker → urgent, work stoppage → high, inconvenience → medium, question → low)
2. Categorize the ticket (bug, feature-request, question, account, billing, other)
3. Suggest the best person or team to handle it based on the category
4. Note any missing information that would help resolve the ticket faster
Keep responses concise and actionable.`,
});
