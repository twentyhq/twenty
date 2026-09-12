import '@/remote/generated/remote-elements';

import { installClassAttributeAccessors } from '@/polyfills/dom/utils/installClassAttributeAccessors';
import { installGetElementsByClassName } from '@/polyfills/dom/utils/installGetElementsByClassName';
import { patchRemoteElementAttributes } from '@/remote/elements/utils/patchRemoteElementAttributes';
import { resolveRemoteElementPrototypes } from '@/remote/elements/utils/resolveRemoteElementPrototypes';

const createHtmlDivElement = (): HTMLElement =>
  document.createElement('html-div');

describe('installClassAttributeAccessors on remote elements', () => {
  beforeAll(() => {
    patchRemoteElementAttributes();
    installClassAttributeAccessors({
      elementPrototype: Element.prototype,
      remoteElementPrototypes: resolveRemoteElementPrototypes(),
    });
    installGetElementsByClassName(Element.prototype);
  });

  it('should read classes assigned to the className remote property', () => {
    const element = createHtmlDivElement();

    element.className = 'from-react second';

    expect(element.classList.contains('from-react')).toBe(true);
    expect(element.classList.length).toBe(2);
    expect(element.classList.value).toBe('from-react second');
  });

  it('should preserve the react authored classes when adding through classList', () => {
    const element = createHtmlDivElement();

    element.className = 'from-react';
    element.classList.add('mapboxgl-map');

    expect(element.className).toBe('from-react mapboxgl-map');
  });

  it('should round trip consecutive classList writes through the remote property', () => {
    const element = createHtmlDivElement();

    element.classList.add('first');
    element.classList.add('second');
    element.classList.remove('first');

    expect(element.className).toBe('second');
  });

  it('should read an empty className on a fresh element while the attribute stays absent', () => {
    const element = createHtmlDivElement();

    expect(element.className).toBe('');
    expect(element.getAttribute('class')).toBeNull();
    expect(element.hasAttribute('class')).toBe(false);
  });

  it('should append through className without an undefined token', () => {
    const element = createHtmlDivElement();

    element.className += ' x';

    expect(element.className).toBe(' x');
    expect(element.classList.contains('x')).toBe(true);
    expect(element.classList.contains('undefined')).toBe(false);
  });

  it('should clear the class attribute when className is assigned null', () => {
    const element = createHtmlDivElement();
    element.className = 'present';

    (element as { className: unknown }).className = null;

    expect(element.hasAttribute('class')).toBe(false);
    expect(element.className).toBe('');
  });

  it('should forward class writes to the host as the className property', () => {
    const element = createHtmlDivElement();
    const updateRemoteProperty = jest.spyOn(
      element as unknown as {
        updateRemoteProperty: (propertyName: string, value?: unknown) => void;
      },
      'updateRemoteProperty',
    );

    element.classList.add('first');
    element.removeAttribute('class');

    expect(updateRemoteProperty.mock.calls).toEqual([
      ['className', 'first'],
      ['className', undefined],
    ]);
  });

  it('should produce a mutation record for a classList write', async () => {
    const element = createHtmlDivElement();
    element.className = 'initial';

    const deliveries: MutationRecord[][] = [];
    const observer = new MutationObserver((records) =>
      deliveries.push(records),
    );
    observer.observe(element, { attributes: true, attributeFilter: ['class'] });

    element.classList.add('added');

    await Promise.resolve();
    await Promise.resolve();

    expect(element.className).toBe('initial added');
    expect(deliveries).toHaveLength(1);
    expect(deliveries[0][0].attributeName).toBe('class');

    observer.disconnect();
  });

  it('should let getElementsByClassName match a remote element classed by react', () => {
    const rootElement = createHtmlDivElement();
    const target = createHtmlDivElement();

    target.className = 'recharts-layer recharts-line';
    rootElement.appendChild(target);

    const matches = rootElement.getElementsByClassName(
      'recharts-layer recharts-line',
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe(target);
  });
});
