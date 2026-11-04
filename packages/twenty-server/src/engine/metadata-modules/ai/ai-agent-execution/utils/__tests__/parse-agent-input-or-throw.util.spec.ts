import { agentResponseFormatSchema } from 'twenty-shared/workflow';

import { parseAgentInputOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/parse-agent-input-or-throw.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

describe('parseAgentInputOrThrow', () => {
  it('names the field it parses in the error', () => {
    expect(() =>
      parseAgentInputOrThrow({
        schema: agentResponseFormatSchema,
        input: { type: 'xml' },
        label: 'response format',
      }),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.INVALID_AGENT_INPUT,
        message: expect.stringMatching(/^Invalid response format: type: /),
      }),
    );
  });
});
