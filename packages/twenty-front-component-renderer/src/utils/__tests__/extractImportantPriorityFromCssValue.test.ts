import { extractImportantPriorityFromCssValue } from '../extractImportantPriorityFromCssValue';

describe('extractImportantPriorityFromCssValue', () => {
  it('should strip a trailing important priority and flag it', () => {
    expect(extractImportantPriorityFromCssValue('red !important')).toEqual({
      cssValueWithoutImportantPriority: 'red',
      hasImportantPriority: true,
    });
  });

  it('should keep a value without an important priority unchanged', () => {
    expect(extractImportantPriorityFromCssValue('red')).toEqual({
      cssValueWithoutImportantPriority: 'red',
      hasImportantPriority: false,
    });
  });

  it('should ignore the word important inside the value', () => {
    expect(extractImportantPriorityFromCssValue('"important"')).toEqual({
      cssValueWithoutImportantPriority: '"important"',
      hasImportantPriority: false,
    });
  });

  it('should not treat important inside a closed quoted value as a priority', () => {
    expect(extractImportantPriorityFromCssValue('"hello !important"')).toEqual({
      cssValueWithoutImportantPriority: '"hello !important"',
      hasImportantPriority: false,
    });
  });

  it('should strip a real priority following a quoted value', () => {
    expect(extractImportantPriorityFromCssValue('"hello" !important')).toEqual({
      cssValueWithoutImportantPriority: '"hello"',
      hasImportantPriority: true,
    });
  });
});
