import { mergeDefaultFunctionInputAndFunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/mergeDefaultFunctionInputAndFunctionInput';

describe('mergeDefaultFunctionInputAndFunctionInput', () => {
  it('should merge properly', () => {
    const newInput = {
      a: null,
      b: null,
      c: { cc: null },
      d: null,
      e: { ee: null },
    };
    const oldInput = { a: 'a', c: 'c', d: { da: null }, e: { ee: 'ee' } };
    const expectedResult = {
      a: 'a',
      b: null,
      c: { cc: null },
      d: null,
      e: { ee: 'ee' },
    };
    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        newInput: newInput,
        oldInput: oldInput,
      }),
    ).toEqual(expectedResult);
  });

  it('should preserve array values without recursing into them as nested objects', () => {
    const newInput = { briefs: [], b: null };
    const oldInput = { briefs: [], b: 5 };

    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        newInput,
        oldInput,
      }),
    ).toEqual({ briefs: [], b: 5 });
  });

  it('should keep an array typed by the user instead of resetting it', () => {
    const newInput = { briefs: [], b: null };
    const oldInput = { briefs: '["a", "b"]', b: null };

    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        newInput,
        oldInput,
      }),
    ).toEqual({ briefs: '["a", "b"]', b: null });
  });
});
