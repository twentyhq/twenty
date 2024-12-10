import { mergeDefaultFunctionInputAndFunctionInput } from '../mergeDefaultFunctionInputAndFunctionInput';

describe('mergeDefaultFunctionInputAndFunctionInput', () => {
  it('should merge properly', () => {
    const defaultFunctionInput = { a: null, b: null, c: { cc: null } };
    const functionInput = { a: 'a', c: 'c' };
    const expectedResult = { a: 'a', b: null, c: { cc: null } };
    expect(
      mergeDefaultFunctionInputAndFunctionInput({
        defaultFunctionInput,
        functionInput,
      }),
    ).toEqual(expectedResult);
  });
});
