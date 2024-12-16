import { getFunctionOutputSchema } from '@/serverless-functions/utils/getFunctionOutputSchema';

describe('getFunctionOutputSchema', () => {
  it('should compute outputSchema properly', () => {
    const testResult = {
      a: null,
      b: 'b',
      c: { cc: 1 },
      d: true,
      e: [1, 2, 3],
    };
    const expectedOutputSchema = {
      a: { isLeaf: true, type: 'unknown', value: null },
      b: { isLeaf: true, type: 'string', value: 'b' },
      c: {
        isLeaf: false,
        value: { cc: { isLeaf: true, type: 'number', value: 1 } },
      },
      d: { isLeaf: true, type: 'boolean', value: true },
      e: { isLeaf: true, type: 'array', value: [1, 2, 3] },
    };
    expect(getFunctionOutputSchema(testResult)).toEqual(expectedOutputSchema);
  });
});
