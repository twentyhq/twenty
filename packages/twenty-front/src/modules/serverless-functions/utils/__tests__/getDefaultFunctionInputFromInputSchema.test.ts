import { InputSchema } from '@/workflow/types/InputSchema';
import { getDefaultFunctionInputFromInputSchema } from '@/serverless-functions/utils/getDefaultFunctionInputFromInputSchema';

describe('getDefaultFunctionInputFromInputSchema', () => {
  it('should init function input properly', () => {
    const inputSchema = [
      {
        type: 'object',
        properties: {
          a: {
            type: 'string',
          },
          b: {
            type: 'number',
          },
          c: {
            type: 'array',
            items: { type: 'string' },
          },
          d: {
            type: 'object',
            properties: {
              da: { type: 'string', enum: ['my', 'enum'] },
              db: { type: 'number' },
            },
          },
          e: { type: 'object' },
        },
      },
    ] as InputSchema;
    const expectedResult = [
      {
        a: null,
        b: null,
        c: [],
        d: { da: 'my', db: null },
        e: {},
      },
    ];
    expect(getDefaultFunctionInputFromInputSchema(inputSchema)).toEqual(
      expectedResult,
    );
  });
});
