import { type StepResult, type ToolSet } from 'ai';

import { mapAiStepsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-ui-message-parts.util';

const buildStep = (
  content: StepResult<ToolSet>['content'],
): Pick<StepResult<ToolSet>, 'content'> => ({ content });

describe('mapAiStepsToUIMessageParts', () => {
  it('turns each step into the parts a chat stream would have stored', () => {
    const parts = mapAiStepsToUIMessageParts([
      buildStep([
        { type: 'reasoning', text: 'Looking the company up first' },
        {
          type: 'tool-call',
          toolCallId: 'call-1',
          toolName: 'find_companies',
          input: { name: 'Acme' },
        },
        {
          type: 'tool-result',
          toolCallId: 'call-1',
          toolName: 'find_companies',
          input: { name: 'Acme' },
          output: { records: [{ id: 'company-1' }] },
        },
      ]),
      buildStep([{ type: 'text', text: 'Acme exists.' }]),
    ]);

    expect(parts).toEqual([
      { type: 'step-start' },
      {
        type: 'reasoning',
        text: 'Looking the company up first',
        providerMetadata: undefined,
      },
      {
        type: 'tool-find_companies',
        toolCallId: 'call-1',
        state: 'output-available',
        input: { name: 'Acme' },
        output: { records: [{ id: 'company-1' }] },
        providerExecuted: undefined,
      },
      { type: 'step-start' },
      { type: 'text', text: 'Acme exists.' },
    ]);
  });

  it('records a failed tool call as an error on its call', () => {
    const parts = mapAiStepsToUIMessageParts([
      buildStep([
        {
          type: 'tool-call',
          toolCallId: 'call-1',
          toolName: 'send_email',
          input: {},
        },
        {
          type: 'tool-error',
          toolCallId: 'call-1',
          toolName: 'send_email',
          input: {},
          error: new Error('No connected account'),
        },
      ]),
    ]);

    expect(parts[1]).toMatchObject({
      type: 'tool-send_email',
      state: 'output-error',
      errorText: 'Error: No connected account',
    });
  });

  // A dangling call is finalized by the storage path, not dropped here.
  it('keeps a call that never got a result as waiting on its input', () => {
    const parts = mapAiStepsToUIMessageParts([
      buildStep([
        {
          type: 'tool-call',
          toolCallId: 'call-1',
          toolName: 'find_people',
          input: {},
        },
      ]),
    ]);

    expect(parts[1]).toMatchObject({ state: 'input-available' });
  });

  it('skips empty text and reasoning', () => {
    expect(
      mapAiStepsToUIMessageParts([
        buildStep([
          { type: 'text', text: '' },
          { type: 'reasoning', text: '' },
        ]),
      ]),
    ).toEqual([{ type: 'step-start' }]);
  });
});
