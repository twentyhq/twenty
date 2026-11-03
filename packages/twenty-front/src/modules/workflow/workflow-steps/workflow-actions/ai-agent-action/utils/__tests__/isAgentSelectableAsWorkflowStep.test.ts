import { isAgentSelectableAsWorkflowStep } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/isAgentSelectableAsWorkflowStep';

const JSON_RESPONSE_FORMAT = {
  type: 'json',
  schema: {
    type: 'object',
    properties: { score: { type: 'number' } },
    required: ['score'],
    additionalProperties: false,
  },
};

describe('isAgentSelectableAsWorkflowStep', () => {
  it('offers an active agent with a JSON output', () => {
    expect(
      isAgentSelectableAsWorkflowStep({
        isActive: true,
        isSystem: false,
        responseFormat: JSON_RESPONSE_FORMAT,
      }),
    ).toBe(true);
  });

  it.each([
    ['a text output', { type: 'text' }],
    ['no output format', null],
    [
      'a JSON output without fields',
      { type: 'json', schema: { type: 'object', properties: {} } },
    ],
  ])('does not offer an agent with %s', (_, responseFormat) => {
    expect(
      isAgentSelectableAsWorkflowStep({
        isActive: true,
        isSystem: false,
        responseFormat,
      }),
    ).toBe(false);
  });

  it('does not offer an inactive or system agent', () => {
    expect(
      isAgentSelectableAsWorkflowStep({
        isActive: false,
        isSystem: false,
        responseFormat: JSON_RESPONSE_FORMAT,
      }),
    ).toBe(false);
    expect(
      isAgentSelectableAsWorkflowStep({
        isActive: true,
        isSystem: true,
        responseFormat: JSON_RESPONSE_FORMAT,
      }),
    ).toBe(false);
  });
});
