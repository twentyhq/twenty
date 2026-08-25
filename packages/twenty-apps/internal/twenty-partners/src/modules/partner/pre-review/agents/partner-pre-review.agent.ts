import { defineAgent } from 'twenty-sdk/define';

import { PARTNER_PRE_REVIEW_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_PRE_REVIEW_PROMPT } from 'src/modules/partner/pre-review/constants/partner-pre-review-prompt.constant';

export default defineAgent({
  universalIdentifier: PARTNER_PRE_REVIEW_AGENT_UNIVERSAL_IDENTIFIER,
  name: 'partner-pre-review',
  label: 'Partner Pre-review',
  icon: 'IconGavel',
  description:
    'Grades a partner application against the pre-review rubric and returns a structured verdict.',
  modelId: 'claude-sonnet-4-5',
  prompt: PARTNER_PRE_REVIEW_PROMPT,
  responseFormat: {
    type: 'json',
    schema: {
      type: 'object',
      properties: {
        verdict: {
          type: 'string',
          description: 'Exactly one of STRONG, WORTH_A_LOOK, WEAK, SPAM.',
        },
        headline: {
          type: 'string',
          description:
            'One sentence, at most 140 characters, stating the decisive reason.',
        },
        evidence: {
          type: 'string',
          description:
            'One finding per line, newline-separated. Each line names the source and what it showed. No bullet characters.',
        },
        flags: {
          type: 'string',
          description:
            'One concern per line, newline-separated. Empty string when there is none.',
        },
        needsHumanLook: {
          type: 'string',
          description:
            'One item per line that a human must open before deciding, newline-separated. Empty string when there is none.',
        },
      },
      required: ['verdict', 'headline', 'evidence', 'flags', 'needsHumanLook'],
      additionalProperties: false,
    },
  },
});
