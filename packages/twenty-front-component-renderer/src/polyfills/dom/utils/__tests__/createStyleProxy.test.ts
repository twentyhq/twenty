import { createStyleProxy } from '../createStyleProxy';

type StyleDeclarationLike = Record<string, unknown> & {
  cssText: string;
  setProperty: (name: string, value: string | null, priority?: string) => void;
  removeProperty: (name: string) => string;
  getPropertyValue: (name: string) => string;
  getPropertyPriority: (name: string) => string;
};

const createStyle = (
  options: Parameters<typeof createStyleProxy>[0] = {},
): StyleDeclarationLike =>
  createStyleProxy(options) as unknown as StyleDeclarationLike;

describe('createStyleProxy', () => {
  it('should store a priority set through setProperty', () => {
    const style = createStyle();

    style.setProperty('color', 'red', 'important');

    expect(style.getPropertyValue('color')).toBe('red');
    expect(style.getPropertyPriority('color')).toBe('important');
    expect(style.cssText).toBe('color:red !important');
  });

  it('should treat the priority as case insensitive', () => {
    const style = createStyle();

    style.setProperty('color', 'red', 'IMPORTANT');

    expect(style.getPropertyPriority('color')).toBe('important');
  });

  it('should clear the priority when the property is set without one', () => {
    const style = createStyle();

    style.setProperty('color', 'red', 'important');
    style.setProperty('color', 'blue');

    expect(style.getPropertyPriority('color')).toBe('');
    expect(style.cssText).toBe('color:blue');
  });

  it('should clear the priority on removeProperty', () => {
    const style = createStyle();

    style.setProperty('color', 'red', 'important');
    style.removeProperty('color');

    expect(style.getPropertyPriority('color')).toBe('');
    expect(style.cssText).toBe('');
  });

  it('should clear the priority on direct property assignment', () => {
    const style = createStyle();

    style.setProperty('color', 'red', 'important');
    style.color = 'blue';

    expect(style.getPropertyPriority('color')).toBe('');
    expect(style.cssText).toBe('color:blue');
  });

  it('should parse a priority out of assigned cssText', () => {
    const style = createStyle();

    style.cssText = 'color: red !important; width: 10px';

    expect(style.getPropertyValue('color')).toBe('red');
    expect(style.getPropertyPriority('color')).toBe('important');
    expect(style.getPropertyPriority('width')).toBe('');
  });

  it('should round trip priorities through cssText', () => {
    const style = createStyle();
    style.setProperty('color', 'red', 'important');
    style.setProperty('width', '10px');

    const other = createStyle();
    other.cssText = style.cssText;

    expect(other.cssText).toBe('color:red !important;width:10px');
  });

  it('should flush the serialized priority to the host', () => {
    const flush = jest.fn();
    const style = createStyle({ flush });

    style.setProperty('color', 'red', 'important');

    expect(flush).toHaveBeenLastCalledWith('color:red !important');
  });

  it('should keep semicolons inside url() values assigned through cssText', () => {
    const style = createStyle();

    style.cssText = 'background-image: url(data:image/png;base64,abc)';

    expect(style.getPropertyValue('background-image')).toBe(
      'url(data:image/png;base64,abc)',
    );
  });
});
