import { defineAgent } from 'twenty-sdk/define';

import { CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { DEFAULT_CALL_RECORDING_SUMMARY_PROMPT } from 'src/constants/default-call-recording-summary-prompt';

export default defineAgent({
  universalIdentifier: CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'companion-summarizer',
  label: 'Desktop Recorder Summarizer',
  icon: 'IconFileText',
  description:
    'Summarizes a meeting transcript into structured Markdown notes stored on the Call Recording.',
  prompt: DEFAULT_CALL_RECORDING_SUMMARY_PROMPT,
  responseFormat: { type: 'text' },
});
