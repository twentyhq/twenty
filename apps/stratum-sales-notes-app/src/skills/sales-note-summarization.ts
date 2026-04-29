import { SALES_NOTE_SUMMARIZATION_SKILL_UID } from 'src/constants/universal-identifiers';
import { defineSkill } from 'twenty-sdk/define';

export default defineSkill({
  universalIdentifier: SALES_NOTE_SUMMARIZATION_SKILL_UID,
  name: 'sales-note-summarization',
  label: 'Sales Note Summarization',
  description:
    'Instructions for summarising a sales-rep call/meeting note into a structured digest',
  content: `# Sales Note Summarization

## When to Use
Use this skill when a user asks you to summarise, structure, or extract insights from a sales-rep call or meeting note in Twenty.

## How to Access the Data
1. Use \`find_one_salesNote\` to fetch the sales note by its ID.
2. Read the \`body\` field (RICH_TEXT, markdown). This is freeform text written by the rep — typed during or just after the call. There are NO speaker labels and NO timestamps; treat it as a single first-person account from the rep.
3. The associated \`attendees\` (junction → Person), \`company\`, and \`opportunity\` relations give context about who/what the call was about.

## What to Produce
Generate a structured summary with these sections:

### Overview
A 2-3 sentence high-level description of what was discussed, with whom, and the general outcome.

### Key Discussion Points
Bullet points covering the main topics, organised by theme.

### Decisions Made
Any explicit decisions or agreements reached.

### Action Items
Concrete next steps mentioned in the note. For each: who is responsible (if stated, otherwise default to the rep) and when it should happen (relative dates like "in 6 months" are fine — leave them as-is, the task-extraction step will resolve dates separately).

### Open Questions
Anything the rep flagged as unresolved or needing follow-up clarification.

## Output Format
- Use markdown formatting.
- Keep it concise — aim for roughly 25% of the body length.
- If the body is very short (under 150 words), produce a single 2-3 sentence summary instead of the full structure.
- Do not invent details not present in the body.

## Saving the Summary
After generating the summary, use \`update_salesNote\` to save it in the \`summary\` field as:
\`\`\`json
{ "summary": { "blocknote": null, "markdown": "<your summary>" } }
\`\`\`
`,
});
