import { DEFAULT_FONT_SHORTHAND } from '@/constants/DefaultFontShorthand';
import { resolveRootContainerFontShorthand } from '../resolveRootContainerFontShorthand';

describe('resolveRootContainerFontShorthand', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return the default for a null root', () => {
    expect(resolveRootContainerFontShorthand(null)).toBe(
      DEFAULT_FONT_SHORTHAND,
    );
  });

  it('should prefer the computed font shorthand', () => {
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      font: '700 20px Inter',
    } as CSSStyleDeclaration);

    expect(
      resolveRootContainerFontShorthand(document.createElement('div')),
    ).toBe('700 20px Inter');
  });

  it('should assemble the shorthand from longhands', () => {
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      font: '',
      fontStyle: 'italic',
      fontWeight: '600',
      fontSize: '14px',
      lineHeight: '20px',
      fontFamily: 'Inter',
    } as CSSStyleDeclaration);

    expect(
      resolveRootContainerFontShorthand(document.createElement('div')),
    ).toBe('italic 600 14px/20px Inter');
  });

  it('should fall back to the default when the size or family is missing', () => {
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      font: '',
      fontSize: '',
      fontFamily: '',
    } as CSSStyleDeclaration);

    expect(
      resolveRootContainerFontShorthand(document.createElement('div')),
    ).toBe(DEFAULT_FONT_SHORTHAND);
  });

  it('should fall back to the default when reading computed styles throws', () => {
    jest.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      throw new Error('boom');
    });

    expect(
      resolveRootContainerFontShorthand(document.createElement('div')),
    ).toBe(DEFAULT_FONT_SHORTHAND);
  });
});
