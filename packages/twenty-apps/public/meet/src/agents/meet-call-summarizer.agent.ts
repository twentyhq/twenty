import { defineAgent } from 'twenty-sdk/define';

import { MEET_CALL_SUMMARY_PROMPT } from 'src/constants/meet-call-summary-prompt.constant';
import { MEET_CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: MEET_CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'meet-call-summarizer',
  label: 'Meet Call Summarizer',
  icon: 'IconFileText',
  description:
    'Summarizes the transcript of a Google Meet call without Gemini notes into Markdown notes on its Call Recording.',
  prompt: MEET_CALL_SUMMARY_PROMPT,
  responseFormat: { type: 'text' },
});
