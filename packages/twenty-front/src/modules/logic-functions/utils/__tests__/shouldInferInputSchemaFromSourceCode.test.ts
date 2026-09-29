import { shouldInferInputSchemaFromSourceCode } from '@/logic-functions/utils/shouldInferInputSchemaFromSourceCode';

describe('shouldInferInputSchemaFromSourceCode', () => {
  it('infers the schema from the main handler parameters', () => {
    expect(shouldInferInputSchemaFromSourceCode({ handlerName: 'main' })).toBe(
      true,
    );
  });

  it('keeps the declared schema of a function copied from an application bundle', () => {
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
