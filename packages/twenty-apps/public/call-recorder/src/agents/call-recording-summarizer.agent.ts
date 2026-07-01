import { defineAgent } from 'twenty-sdk/define';

import { CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-summarizer-agent-universal-identifier';

export default defineAgent({
  universalIdentifier: CALL_RECORDING_SUMMARIZER_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'call-recording-summarizer',
  label: 'Call Recording Summarizer',
  icon: 'IconFileText',
  description:
    'Summarizes a meeting transcript into structured Markdown notes stored on the Call Recording.',
  prompt:
    'Summarize call recording transcripts using the instructions provided at runtime.',
  responseFormat: { type: 'text' },
});
