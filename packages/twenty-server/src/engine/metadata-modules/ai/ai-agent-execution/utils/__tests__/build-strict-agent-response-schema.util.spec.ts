import { buildStrictAgentResponseSchema } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-strict-agent-response-schema.util';

describe('buildStrictAgentResponseSchema', () => {
  it('adds additionalProperties false and requires every property when both are missing', () => {
    expect(
      buildStrictAgentResponseSchema({
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Summary' },
          score: { type: 'number' },
        },
      }),
    ).toEqual({
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Summary' },
        score: { type: 'number' },
      },
      required: ['summary', 'score'],
      additionalProperties: false,
    });
  });

  it('requires every property when only some are listed as required', () => {
    expect(
      buildStrictAgentResponseSchema({
        type: 'object',
        properties: {
          summary: { type: 'string' },
          isQualified: { type: 'boolean' },
        },
        required: ['summary'],
        additionalProperties: false,
      }).required,
    ).toEqual(['summary', 'isQualified']);
  });
});
