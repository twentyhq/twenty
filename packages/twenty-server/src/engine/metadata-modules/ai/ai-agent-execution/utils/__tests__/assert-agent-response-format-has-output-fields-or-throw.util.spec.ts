import { type AgentResponseFormat } from 'twenty-shared/ai';

import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

describe('assertAgentResponseFormatHasOutputFieldsOrThrow', () => {
  it('does not throw without a response format', () => {
    expect(() =>
      assertAgentResponseFormatHasOutputFieldsOrThrow(undefined),
    ).not.toThrow();
  });

  it('does not throw for a text response format', () => {
    expect(() =>
      assertAgentResponseFormatHasOutputFieldsOrThrow({ type: 'text' }),
    ).not.toThrow();
  });

  it('does not throw for a json response format with output fields', () => {
    expect(() =>
      assertAgentResponseFormatHasOutputFieldsOrThrow({
        type: 'json',
        schema: {
          type: 'object',
          properties: { summary: { type: 'string' } },
        },
      }),
    ).not.toThrow();
  });

  it('throws an invalid agent input error when a json schema has no properties', () => {
    const responseFormatSavedWithoutProperties = {
      type: 'json',
      schema: { type: 'object' },
    } as AgentResponseFormat;

    expect(() =>
      assertAgentResponseFormatHasOutputFieldsOrThrow(
        responseFormatSavedWithoutProperties,
      ),
    ).toThrow(
      new AiException(
        'This agent has no output fields. Add at least one output field to its response format.',
        AiExceptionCode.INVALID_AGENT_INPUT,
      ),
    );
  });
});
