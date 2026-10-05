import { stripImportantPriorityFromCssValue } from '../stripImportantPriorityFromCssValue';

describe('stripImportantPriorityFromCssValue', () => {
  it('should strip a trailing important priority', () => {
    expect(stripImportantPriorityFromCssValue('red !important')).toBe('red');
  });

  it('should keep a value without an important priority unchanged', () => {
    expect(stripImportantPriorityFromCssValue('red')).toBe('red');
  });

  it('should ignore the word important inside a quoted value', () => {
    expect(stripImportantPriorityFromCssValue('"hello !important"')).toBe(
      '"hello !important"',
    );
  });

  it('should strip a real priority following a quoted value', () => {
    expect(stripImportantPriorityFromCssValue('"hello" !important')).toBe(
      '"hello"',
    );
  });
});
