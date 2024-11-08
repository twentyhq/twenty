import { getDefaultFunctionInputFromInputSchema } from '@/workflow/utils/getDefaultFunctionInputFromInputSchema';
import { InputSchema } from '@/workflow/types/InputSchema';

describe('getDefaultFunctionInputFromInputSchema', () => {
  it('should init function input properly', () => {
    const inputSchema = {
      params: {
        type: 'object',
        properties: {
          a: {
            type: 'string',
          },
          b: {
            type: 'number',
          },
        },
      },
    } as InputSchema;
    const expectedResult = {
      params: {
        a: null,
        b: null,
      },
    };
    expect(getDefaultFunctionInputFromInputSchema(inputSchema)).toEqual(
      expectedResult,
    );
  });
});
