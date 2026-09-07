import { Window } from '@remote-dom/polyfill';

import { installClassList } from '@/polyfills/dom/utils/installClassList';
import { installClassName } from '@/polyfills/dom/utils/installClassName';

const createSandboxDocument = (polyfillWindow = new Window()): Document => {
  installClassName(polyfillWindow.Element.prototype);
  installClassList(polyfillWindow.Element.prototype);

  return polyfillWindow.document as unknown as Document;
};

describe('installClassName', () => {
  it('should read the class attribute back through the className property', () => {
    const document = createSandboxDocument();

    const element = document.createElement('div');
    element.setAttribute('class', 'from-attribute');

    expect(element.className).toBe('from-attribute');
  });

  it('should refuse a read on the prototype itself', () => {
    const polyfillWindow = new Window();
    createSandboxDocument(polyfillWindow);

    expect(
      () =>
        (polyfillWindow.Element.prototype as unknown as { className: unknown })
          .className,
    ).toThrow(TypeError);
  });

  it('should return an empty string for an element without a class attribute', () => {
    const document = createSandboxDocument();

    expect(document.createElement('div').className).toBe('');
  });

  it('should write the class attribute when the className property is assigned', () => {
    const document = createSandboxDocument();

    const element = document.createElement('div');
    element.className = 'from-property';

    expect(element.getAttribute('class')).toBe('from-property');
  });

  it('should stringify non string assignments like the DOM does', () => {
    const document = createSandboxDocument();

    const element = document.createElement('div');
    (element as { className: unknown }).className = 42;

    expect(element.getAttribute('class')).toBe('42');
  });

  it('should keep className and classList in agreement in both directions', () => {
    const document = createSandboxDocument();

    const element = document.createElement('div');
    element.className = 'first';

    expect(element.classList.contains('first')).toBe(true);

    element.classList.add('second');

    expect(element.className).toBe('first second');
  });
});
