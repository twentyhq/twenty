import { describe, expect, it } from 'vitest';

import { buildSlackAssistantPrompt } from 'src/logic-functions/utils/build-slack-assistant-prompt';

const BASE_INPUT = {
  requestText: 'create a company called ACME',
  requesterName: 'Ada',
  conversationContext: undefined,
  timeoutSeconds: 240,
};

describe('buildSlackAssistantPrompt', () => {
  it('should tell the agent how to build record links when the workspace URL is known', () => {
    const prompt = buildSlackAssistantPrompt({
      ...BASE_INPUT,
      workspaceBaseUrl: 'https://acme.twenty.com',
    });

    expect(prompt).toContain(
      '[Record Name](https://acme.twenty.com/object/<objectNameSingular>/<recordId>)',
    );
  });

  it('should tell the agent not to write URLs when the workspace URL is unknown', () => {
    const prompt = buildSlackAssistantPrompt({
      ...BASE_INPUT,
      workspaceBaseUrl: undefined,
    });

    expect(prompt).toContain('record links are unavailable');
    expect(prompt).not.toContain('/object/');
  });
});
