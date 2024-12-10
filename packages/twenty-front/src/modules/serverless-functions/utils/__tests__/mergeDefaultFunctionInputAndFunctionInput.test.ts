import { mergeDefaultFunctionInputAndFunctionInput } from '../mergeDefaultFunctionInputAndFunctionInput';

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
});
