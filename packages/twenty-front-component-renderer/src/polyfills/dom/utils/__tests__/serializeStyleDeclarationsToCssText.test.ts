import { serializeStyleDeclarationsToCssText } from '../serializeStyleDeclarationsToCssText';

describe('serializeStyleDeclarationsToCssText', () => {
  it('should join declarations with semicolons', () => {
    expect(
      serializeStyleDeclarationsToCssText({ color: 'red', width: '10px' }),
    ).toBe('color:red;width:10px');
  });

  it('should return an empty string for no declarations', () => {
    expect(serializeStyleDeclarationsToCssText({})).toBe('');
  });
});
