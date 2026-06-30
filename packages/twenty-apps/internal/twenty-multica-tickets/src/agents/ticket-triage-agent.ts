import { defineAgent } from 'twenty-sdk/define';

import { TICKET_TRIAGE_AGENT_ID } from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: TICKET_TRIAGE_AGENT_ID,
  name: 'ticket-triage-agent',
  label: 'Ticket Triage Agent',
  description:
    'Automatically triages incoming support tickets — determines priority, category, and suggests assignment.',
  icon: 'IconRobot',
  prompt:
    'You are a support ticket triage agent for XO Pure CRM. Review the ticket description and determine: (1) urgency level, (2) category, (3) suggested assignee role. Be decisive — when in doubt, default to medium priority and the general support queue. Return JSON with priority, category, suggestedAssignee, and needsMoreInfo.',
});
