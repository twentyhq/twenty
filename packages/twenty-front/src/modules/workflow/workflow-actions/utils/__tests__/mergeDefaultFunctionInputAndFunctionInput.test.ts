import { mergeDefaultFunctionInputAndFunctionInput } from '../mergeDefaultFunctionInputAndFunctionInput';

describe('mergeDefaultFunctionInputAndFunctionInput', () => {
  it('should merge properly', () => {
    const defaultFunctionInput = {
      params: { a: null, b: null, c: { cc: null } },
    };
    const functionInput = {
      params: { a: 'a', c: 'c' },
    };
    const expectedResult = {
      params: { a: 'a', b: null, c: { cc: null } },
    };
    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        defaultFunctionInput,
        functionInput,
      }),
    ).toEqual(expectedResult);
  });
});
