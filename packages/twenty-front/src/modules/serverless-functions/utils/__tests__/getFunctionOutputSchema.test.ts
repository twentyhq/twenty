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
      a: {
        isLeaf: true,
        type: 'unknown',
        value: null,
        icon: 'IconVariable',
        label: 'a',
      },
      b: {
        isLeaf: true,
        type: 'string',
        value: 'b',
        icon: 'IconVariable',
        label: 'b',
      },
      c: {
        isLeaf: false,
        icon: 'IconVariable',
        value: {
          cc: {
            isLeaf: true,
            type: 'number',
            value: 1,
            icon: 'IconVariable',
            label: 'cc',
          },
        },
      },
      d: {
        isLeaf: true,
        type: 'boolean',
        value: true,
        icon: 'IconVariable',
        label: 'd',
      },
      e: {
        isLeaf: true,
        type: 'array',
        value: [1, 2, 3],
        icon: 'IconVariable',
        label: 'e',
      },
    };
    expect(getFunctionOutputSchema(testResult)).toEqual(expectedOutputSchema);
  });
});
