import { defineAgent } from 'twenty-sdk/define';

import { ACCOUNT_BRIEF_SYNTHESIZER_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ACCOUNT_BRIEF_SYSTEM_PROMPT } from 'src/agents/account-brief-system-prompt.constant';

export default defineAgent({
  universalIdentifier: ACCOUNT_BRIEF_SYNTHESIZER_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'account-brief-synthesizer',
  label: 'Account Brief Synthesizer',
  icon: 'IconSparkles',
  description:
    'Synthesizes recent timeline activity of a Company or Person into a living account brief with an overall sentiment.',
  prompt: ACCOUNT_BRIEF_SYSTEM_PROMPT,
  responseFormat: { type: 'text' },
});
