import { defineSkill } from 'twenty-sdk';

export const CALL_TRANSCRIPT_SUMMARIZATION_SKILL_UNIVERSAL_IDENTIFIER =
  '11fb51a7-4d5a-4168-91d7-9fbe5eb7d609';

export default defineSkill({
  universalIdentifier: CALL_TRANSCRIPT_SUMMARIZATION_SKILL_UNIVERSAL_IDENTIFIER,
  name: 'call-transcript-summarization',
  label: 'Call Transcript Summarization',
  description:
    'Instructions for summarizing and analyzing call recording transcripts',
  content: `# Call Transcript Summarization

## When to Use
Use this skill when a user asks you to summarize, analyze, or extract insights from a call recording.

## How to Access the Data
1. Use \`find_one_callRecording\` to fetch the call recording by its ID.
2. Read the \`transcript\` field (RICH_TEXT_V2, markdown format) which contains the full conversation.
3. The transcript uses the format: **Speaker Name:** spoken text

## What to Produce
Generate a structured summary with these sections:

### Overview
A 2-3 sentence high-level description of what the call was about, who participated, and the general outcome.

### Key Discussion Points
Bullet points covering the main topics discussed, organized chronologically or by theme.

### Decisions Made
Any explicit decisions or agreements reached during the call.

### Action Items
Concrete next steps mentioned during the call, including who is responsible (if stated).

### Sentiment & Tone
A brief note on the overall tone of the conversation (collaborative, tense, exploratory, etc.).

## Output Format
- Use markdown formatting.
- Keep the summary concise — aim for roughly 20% of the transcript length.
- If the transcript is very short (under 200 words), provide a brief 2-3 sentence summary instead of the full structure.

## Saving the Summary
After generating the summary, use \`update_callRecording\` to save it in the \`summary\` field with the format:
\`\`\`json
{ "summary": { "blocknote": null, "markdown": "<your summary>" } }
\`\`\`
`,
});
