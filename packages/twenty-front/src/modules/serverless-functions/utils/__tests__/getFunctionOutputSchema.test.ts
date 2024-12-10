import { getFunctionOutputSchema } from '@/serverless-functions/utils/getFunctionOutputSchema';

describe('getFunctionOutputSchema', () => {
  it('should compute outputSchema properly', () => {
    const testResult = { a: null, b: 'b', c: { cc: 1 } };
    const expectedOutputSchema = {
      a: { isLeaf: true, type: 'object', value: null },
      b: { isLeaf: true, type: 'string', value: 'b' },
      c: {
        isLeaf: true,
        type: 'object',
        value: { cc: 1 },
      },
    };
    expect(getFunctionOutputSchema(testResult)).toEqual(expectedOutputSchema);
  });
});
