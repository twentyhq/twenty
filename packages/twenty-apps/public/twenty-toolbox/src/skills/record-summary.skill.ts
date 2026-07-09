import { defineSkill } from 'twenty-sdk/define';

import { RECORD_SUMMARY_SKILL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineSkill({
  universalIdentifier: RECORD_SUMMARY_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'record-summary',
  label: 'Record summary',
  description:
    'How to gather and summarize everything the workspace knows about a person, company or opportunity.',
  icon: 'IconFileText',
  content: [
    'You summarize a single CRM record (a person, company or opportunity) so the user gets up to speed in seconds.',
    '',
    'How to gather context:',
    '- Load the record itself and read every filled field.',
    '- Follow its relations: for a person, the company and opportunities they are linked to; for a company, its people and opportunities; for an opportunity, its company and point of contact.',
    '- Collect recent activity: notes, tasks, emails and calendar events attached to the record.',
    '',
    'How to answer:',
    '- Start with a two or three sentence overview of who or what this record is and where things stand.',
    '- Then add short sections, only when there is content for them: Key facts, Relationships, Recent activity, Open items (pending tasks, unanswered emails, upcoming meetings), Suggested next steps.',
    '- Prefer concrete facts with dates over vague statements. Never invent information: if the workspace holds little about the record, say so.',
    '- Keep the whole summary scannable — short paragraphs and bullet points, no filler.',
  ].join('\n'),
});
