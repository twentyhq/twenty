import { defineAgent } from 'twenty-sdk/define';

import { CALL_SUMMARY_PROMPT } from 'src/constants/call-summary-prompt.constant';
import { CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineAgent({
  universalIdentifier: CALL_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'teams-call-summarizer',
  label: 'Teams Call Summarizer',
  icon: 'IconFileText',
  description:
    'Summarizes an imported Teams transcript into structured Markdown notes stored on the Call Recording.',
  prompt: CALL_SUMMARY_PROMPT,
  responseFormat: { type: 'text' },
});
