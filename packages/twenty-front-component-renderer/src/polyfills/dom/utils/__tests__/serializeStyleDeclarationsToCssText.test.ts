import { serializeStyleDeclarationsToCssText } from '../serializeStyleDeclarationsToCssText';

describe('serializeStyleDeclarationsToCssText', () => {
  it('should join declarations with semicolons', () => {
    expect(
      serializeStyleDeclarationsToCssText(
        { color: 'red', width: '10px' },
        new Set(),
      ),
    ).toBe('color:red;width:10px');
  });

  it('should append important to declarations with an important priority', () => {
    expect(
      serializeStyleDeclarationsToCssText(
        { color: 'red', width: '10px' },
        new Set(['color']),
      ),
    ).toBe('color:red !important;width:10px');
  });

  it('should return an empty string for no declarations', () => {
    expect(serializeStyleDeclarationsToCssText({}, new Set())).toBe('');
  });
});
