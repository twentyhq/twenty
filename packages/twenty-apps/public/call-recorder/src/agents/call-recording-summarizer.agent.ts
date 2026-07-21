import { defineAgent } from 'twenty-sdk/define';

import { CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-summarizer-agent-universal-identifier';
import { DEFAULT_CALL_RECORDING_SUMMARY_PROMPT } from 'src/constants/default-call-recording-summary-prompt';

export default defineAgent({
  universalIdentifier: CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'call-recording-summarizer',
  label: 'Call Recording Summarizer',
  icon: 'IconFileText',
  description:
    'Summarizes a meeting transcript into structured Markdown notes stored on the Call Recording.',
  prompt: DEFAULT_CALL_RECORDING_SUMMARY_PROMPT,
  responseFormat: { type: 'text' },
});
