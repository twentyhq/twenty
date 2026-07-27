import { createStyleProxy } from '../createStyleProxy';

describe('createStyleProxy', () => {
  it('should round trip a property through setProperty and getPropertyValue', () => {
    const style = createStyleProxy(() => {});

    style.setProperty('color', 'red');

    expect(style.getPropertyValue('color')).toBe('red');
    expect(style.cssText).toBe('color:red');
  });

  it('should flush every mutation synchronously with the serialized cssText', () => {
    const flush = jest.fn();
    const style = createStyleProxy(flush);

    style.setProperty('color', 'red');
    style.width = 10;
    style.removeProperty('color');

    expect(flush.mock.calls.map(([serializedCssText]) => serializedCssText)).toEqual([
      'color:red',
      'color:red;width:10px',
      'width:10px',
    ]);
  });

  it('should accept an important priority and store the plain value', () => {
    const style = createStyleProxy(() => {});

    style.setProperty('color', 'red', 'IMPORTANT');

    expect(style.getPropertyValue('color')).toBe('red');
    expect(style.cssText).toBe('color:red');
  });

  it('should ignore setProperty with an invalid priority', () => {
    const flush = jest.fn();
    const style = createStyleProxy(flush);

    style.setProperty('color', 'red', 'loud');

    expect(style.getPropertyValue('color')).toBe('');
    expect(flush).not.toHaveBeenCalled();
  });

  it('should ignore setProperty with a whitespace-padded important priority', () => {
    const style = createStyleProxy(() => {});

    style.setProperty('color', 'red', ' important ');

    expect(style.getPropertyValue('color')).toBe('');
  });

  it('should remove the property when the value is empty even with an invalid priority', () => {
    const style = createStyleProxy(() => {});

    style.setProperty('color', 'red');
    style.setProperty('color', '', 'loud');

    expect(style.getPropertyValue('color')).toBe('');
    expect(style.cssText).toBe('');
  });

  it('should normalize the property name passed to setProperty and getPropertyValue', () => {
    const style = createStyleProxy(() => {});

    style.setProperty('COLOR', 'red');

    expect(style.getPropertyValue('color')).toBe('red');
    expect(style.color).toBe('red');
  });

  it('should replace all declarations when cssText is assigned', () => {
    const style = createStyleProxy(() => {});

    style.setProperty('color', 'red');
    style.cssText = 'width: 10px; height: 20px';

    expect(style.getPropertyValue('color')).toBe('');
    expect(style.cssText).toBe('width:10px;height:20px');
  });

  it('should resolve direct camelCase assignment to the css property name', () => {
    const style = createStyleProxy(() => {});

    style.backgroundColor = 'red';

    expect(style.getPropertyValue('background-color')).toBe('red');
    expect(style.backgroundColor).toBe('red');
  });

  it('should map the cssFloat alias to the float property', () => {
    const style = createStyleProxy(() => {});

    style.cssFloat = 'left';

    expect(style.cssText).toBe('float:left');
  });

  it('should remove a property on empty direct assignment', () => {
    const style = createStyleProxy(() => {});

    style.color = 'red';
    style.color = '';

    expect(style.cssText).toBe('');
  });

  it('should append px to numeric values while keeping unitless properties unitless', () => {
    const style = createStyleProxy(() => {});

    style.width = 10;
    style.aspectRatio = 2;

    expect(style.getPropertyValue('width')).toBe('10px');
    expect(style.getPropertyValue('aspect-ratio')).toBe('2');
  });

  it('should preserve the exact custom property key on direct assignment', () => {
    const style = createStyleProxy(() => {});

    style['--myVar'] = '2px';

    expect(style.cssText).toBe('--myVar:2px');
    expect(style['--myVar']).toBe('2px');
  });

  it('should keep Object.prototype methods callable', () => {
    const style = createStyleProxy(() => {});

    style.setProperty('color', 'red');

    expect(style.hasOwnProperty('color')).toBe(true);
    expect(style.hasOwnProperty('background')).toBe(false);
    expect(() => `${style}`).not.toThrow();
    expect(String(style)).toBe('[object Object]');
  });
});
