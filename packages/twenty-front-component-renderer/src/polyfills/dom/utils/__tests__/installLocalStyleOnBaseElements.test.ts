import { installLocalStyleOnBaseElements } from '../installLocalStyleOnBaseElements';

class FakeElement {}
class FakeRemoteElement extends FakeElement {}

describe('installLocalStyleOnBaseElements', () => {
  beforeAll(() => {
    installLocalStyleOnBaseElements(FakeElement.prototype);
  });

  it('should make Object.assign onto element style succeed', () => {
    const element = new FakeElement() as unknown as HTMLElement;

    expect(() =>
      Object.assign(element.style, { position: 'absolute', fontSize: '14px' }),
    ).not.toThrow();
    expect(element.style.fontSize).toBe('14px');
  });

  it('should round trip values through getPropertyValue', () => {
    const element = new FakeElement() as unknown as HTMLElement;

    element.style.fontFamily = 'Inter';

    expect(element.style.getPropertyValue('font-family')).toBe('Inter');
  });

  it('should return a distinct declaration per element', () => {
    const first = new FakeElement() as unknown as HTMLElement;
    const second = new FakeElement() as unknown as HTMLElement;

    first.style.color = 'red';

    expect(second.style.color).toBe('');
  });

  it('should keep semicolons inside quoted values and urls in cssText', () => {
    const element = new FakeElement() as unknown as HTMLElement;

    element.style.cssText =
      'content: "a;b"; background: url(data:image/png;base64,abc)';

    expect(element.style.getPropertyValue('content')).toBe('"a;b"');
    expect(element.style.getPropertyValue('background')).toBe(
      'url(data:image/png;base64,abc)',
    );
  });

  it('should populate declarations from a cssText assignment', () => {
    const element = new FakeElement() as unknown as HTMLElement;

    element.style.color = 'red';
    element.style.cssText = 'font-size: 14px; font-weight: 700';

    expect(element.style.getPropertyValue('font-size')).toBe('14px');
    expect(element.style.getPropertyValue('font-weight')).toBe('700');
    expect(element.style.getPropertyValue('color')).toBe('');
    expect(element.style.getPropertyValue('css-text')).toBe('');
  });

  it('should return the same declaration across reads of one element', () => {
    const element = new FakeElement() as unknown as HTMLElement;

    expect(element.style).toBe(element.style);
  });

  it('should be shadowed by a style property defined on a subclass prototype', () => {
    const subclassStyle = { marker: 'subclass' };
    Object.defineProperty(FakeRemoteElement.prototype, 'style', {
      get: () => subclassStyle,
      configurable: true,
    });

    const element = new FakeRemoteElement() as unknown as HTMLElement;

    expect(element.style).toBe(subclassStyle as unknown as CSSStyleDeclaration);
  });
});
