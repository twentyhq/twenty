import { shouldInferInputSchemaFromSourceCode } from '@/logic-functions/utils/shouldInferInputSchemaFromSourceCode';

describe('shouldInferInputSchemaFromSourceCode', () => {
  it('infers the schema when the handler is a top-level function', () => {
    expect(shouldInferInputSchemaFromSourceCode({ handlerName: 'main' })).toBe(
      true,
    );
    expect(
      shouldInferInputSchemaFromSourceCode({ handlerName: 'handler' }),
    ).toBe(true);
  });

  it('keeps the declared schema when the handler is a nested member, as in an application bundle', () => {
    expect(
      shouldInferInputSchemaFromSourceCode({
        handlerName: 'default.config.handler',
      }),
    ).toBe(false);
  });

  it('infers the schema while the function is not loaded yet', () => {
    expect(shouldInferInputSchemaFromSourceCode(null)).toBe(true);
  });
});
