import { defineAgent } from 'twenty-sdk/define';

import { GOOGLE_MEET_CALL_SUMMARY_PROMPT } from 'src/constants/google-meet-call-summary-prompt.constant';
import { GOOGLE_MEET_CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: GOOGLE_MEET_CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'google-meet-call-summarizer',
  label: 'Meet Call Summarizer',
  icon: 'IconFileText',
  description:
    'Summarizes the transcript of a Google Meet call without Gemini notes into Markdown notes on its Call Recording.',
  prompt: GOOGLE_MEET_CALL_SUMMARY_PROMPT,
  responseFormat: { type: 'text' },
});
