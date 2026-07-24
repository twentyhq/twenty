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

  it('should ignore setProperty with an invalid priority', () => {
    const flush = jest.fn();
    const style = createStyle({ flushSerializedCssTextToHost: flush });

    style.setProperty('color', 'red', 'loud');

    expect(style.getPropertyValue('color')).toBe('');
    expect(style.cssText).toBe('');
  });

  it('should not flush a setProperty call with an invalid priority', async () => {
    const flush = jest.fn();
    const style = createStyle({ flushSerializedCssTextToHost: flush });

    style.setProperty('color', 'red', 'loud');

    await Promise.resolve();

    expect(flush).not.toHaveBeenCalled();
  });

  it('should remove the property when the value is empty even with an invalid priority', () => {
    const style = createStyle();

    style.setProperty('color', 'red', 'important');
    style.setProperty('color', '', 'loud');

    expect(style.getPropertyValue('color')).toBe('');
    expect(style.getPropertyPriority('color')).toBe('');
    expect(style.cssText).toBe('');
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

  it('should let the last duplicate declaration win in assigned cssText', () => {
    const style = createStyle();

    style.cssText = 'color: red; color: blue';

    expect(style.getPropertyValue('color')).toBe('blue');
  });

  it('should keep an earlier important declaration over a later normal duplicate', () => {
    const style = createStyle();

    style.cssText = 'color: red !important; color: blue';

    expect(style.getPropertyValue('color')).toBe('red');
    expect(style.getPropertyPriority('color')).toBe('important');
  });

  it('should let a later important duplicate replace an earlier important one', () => {
    const style = createStyle();

    style.cssText = 'color: red !important; color: blue !important';

    expect(style.getPropertyValue('color')).toBe('blue');
    expect(style.getPropertyPriority('color')).toBe('important');
  });

  it('should round trip priorities through cssText', () => {
    const style = createStyle();
    style.setProperty('color', 'red', 'important');
    style.setProperty('width', '10px');

    const other = createStyle();
    other.cssText = style.cssText;

    expect(other.cssText).toBe('color:red !important;width:10px');
  });

  it('should flush the serialized priority to the host', async () => {
    const flush = jest.fn();
    const style = createStyle({ flushSerializedCssTextToHost: flush });

    style.setProperty('color', 'red', 'important');

    await Promise.resolve();

    expect(flush).toHaveBeenLastCalledWith('color:red !important');
  });

  it('should flush a burst of writes once with the final serialization', async () => {
    const flush = jest.fn();
    const style = createStyle({ flushSerializedCssTextToHost: flush });

    style.setProperty('color', 'red');
    style.setProperty('width', '10px');
    style.removeProperty('color');

    await Promise.resolve();

    expect(flush).toHaveBeenCalledTimes(1);
    expect(flush).toHaveBeenCalledWith('width:10px');
  });

  it('should apply a declaration preceded by a comment to the real property', () => {
    const style = createStyle();

    style.cssText = 'color: red; /* note */ background: blue';

    expect(style.getPropertyValue('color')).toBe('red');
    expect(style.getPropertyValue('background')).toBe('blue');
  });

  it('should keep semicolons inside url() values assigned through cssText', () => {
    const style = createStyle();

    style.cssText = 'background-image: url(data:image/png;base64,abc)';

    expect(style.getPropertyValue('background-image')).toBe(
      'url(data:image/png;base64,abc)',
    );
  });

  it('should append px to numeric length values when converting', () => {
    const style = createStyle({ shouldConvertNumbersToPixels: true });

    style.width = 10;

    expect(style.getPropertyValue('width')).toBe('10px');
  });

  it('should keep unitless numeric values unitless when converting', () => {
    const style = createStyle({ shouldConvertNumbersToPixels: true });

    style.aspectRatio = 2;
    style.scale = 3;

    expect(style.getPropertyValue('aspect-ratio')).toBe('2');
    expect(style.getPropertyValue('scale')).toBe('3');
  });

  it('should round trip a custom property set through setProperty', () => {
    const style = createStyle();

    style.setProperty('--myVar', '1px');

    expect(style.getPropertyValue('--myVar')).toBe('1px');
  });

  it('should preserve the exact custom property key on direct assignment', () => {
    const style = createStyle();

    style['--myVar'] = '2px';

    expect(style.cssText).toBe('--myVar:2px');
    expect(style['--myVar']).toBe('2px');
  });

  it('should ignore setProperty with a whitespace-padded important priority', () => {
    const style = createStyle();

    style.setProperty('color', 'red', ' important ');

    expect(style.getPropertyValue('color')).toBe('');
  });

  it('should not convert a numeric custom property to pixels', () => {
    const style = createStyle({ shouldConvertNumbersToPixels: true });

    style['--gap'] = 4;

    expect(style.getPropertyValue('--gap')).toBe('4');
  });

  it('should map the cssFloat alias to the float property', () => {
    const style = createStyle();

    style.cssFloat = 'left';

    expect(style.cssText).toBe('float:left');
  });

  it('should lowercase standard property names parsed from cssText', () => {
    const style = createStyle();

    style.cssText = 'COLOR: red';

    expect(style.color).toBe('red');
    expect(style.getPropertyValue('color')).toBe('red');
  });

  it('should keep Object.prototype methods callable', () => {
    const style = createStyle();

    style.setProperty('color', 'red');

    expect(style.hasOwnProperty('color')).toBe(true);
    expect(style.hasOwnProperty('background')).toBe(false);
    expect(() => `${style}`).not.toThrow();
    expect(String(style)).toBe('[object Object]');
  });
});
