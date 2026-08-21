import '@/remote/generated/remote-elements';

import { installClassList } from '@/polyfills/dom/utils/installClassList';
import { installGetElementsByClassName } from '@/polyfills/dom/utils/installGetElementsByClassName';
import { patchRemoteElementAttributes } from '@/remote/elements/utils/patchRemoteElementAttributes';

const createHtmlDivElement = (): HTMLElement =>
  document.createElement('html-div');

describe('installClassList on remote elements', () => {
  beforeAll(() => {
    patchRemoteElementAttributes();
    installClassList(Element.prototype);
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

  it('should not produce a mutation record because the write goes through the remote property', async () => {
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
    expect(deliveries).toHaveLength(0);

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
