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
      a: { isLeaf: true, type: 'unknown', value: null, icon: 'IconVariable' },
      b: { isLeaf: true, type: 'string', value: 'b', icon: 'IconVariable' },
      c: {
        isLeaf: false,
        icon: 'IconVariable',
        value: {
          cc: { isLeaf: true, type: 'number', value: 1, icon: 'IconVariable' },
        },
      },
      d: { isLeaf: true, type: 'boolean', value: true, icon: 'IconVariable' },
      e: {
        isLeaf: true,
        type: 'array',
        value: [1, 2, 3],
        icon: 'IconVariable',
      },
    };
    expect(getFunctionOutputSchema(testResult)).toEqual(expectedOutputSchema);
  });
});
