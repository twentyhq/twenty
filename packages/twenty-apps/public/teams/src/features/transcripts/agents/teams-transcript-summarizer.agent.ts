import { defineAgent } from 'twenty-sdk/define';

import { DEFAULT_TEAMS_TRANSCRIPT_SUMMARY_PROMPT } from 'src/features/transcripts/constants/default-teams-transcript-summary-prompt';
import { TEAMS_TRANSCRIPT_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: TEAMS_TRANSCRIPT_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'teams-transcript-summarizer',
  label: 'Teams Transcript Summarizer',
  icon: 'IconFileText',
  description:
    'Summarizes an imported Microsoft Teams transcript into structured Markdown notes stored on the Call Recording.',
  prompt: DEFAULT_TEAMS_TRANSCRIPT_SUMMARY_PROMPT,
  responseFormat: { type: 'text' },
});
