import { Window } from '@remote-dom/polyfill';

import { installClassList } from '@/polyfills/dom/utils/installClassList';
import { installClassName } from '@/polyfills/dom/utils/installClassName';
import { installGetElementsByClassName } from '@/polyfills/dom/utils/installGetElementsByClassName';

const createSandboxDocument = (): Document => {
  const polyfillWindow = new Window();

  installClassName(polyfillWindow.Element.prototype);
  installClassList(polyfillWindow.Element.prototype);
  installGetElementsByClassName(polyfillWindow.Element.prototype);

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
    installClassName(polyfillWindow.Element.prototype);

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

  it('should let getElementsByClassName match an element classed through the property', () => {
    const document = createSandboxDocument();

    const rootElement = document.createElement('div');
    const target = document.createElement('div');
    target.className = 'recharts-layer recharts-line';

    rootElement.appendChild(target);

    const matches = rootElement.getElementsByClassName(
      'recharts-layer recharts-line',
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe(target);
  });
});
