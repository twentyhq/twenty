import { Window } from '@remote-dom/polyfill';

import { installElementDatasetPolyfill } from '../installElementDatasetPolyfill';

const createPolyfillElement = (): HTMLElement => {
  const polyfillWindow = new Window();

  installElementDatasetPolyfill(polyfillWindow.Element.prototype);

  return polyfillWindow.document.createElement('div') as unknown as HTMLElement;
};

describe('installElementDatasetPolyfill', () => {
  it('should read data attributes through their camel-cased names', () => {
    const element = createPolyfillElement();

    element.setAttribute('data-dropdown-page-type', 'picker');

    expect(element.dataset.dropdownPageType).toBe('picker');
    expect('dropdownPageType' in element.dataset).toBe(true);
    expect(element.dataset.missingValue).toBeUndefined();
    expect('missingValue' in element.dataset).toBe(false);
  });

  it('should write and delete the matching data attributes', () => {
    const element = createPolyfillElement();

    element.dataset.tabindex = '';
    element.dataset.dropdownPage = 'assignees';

    expect(element.getAttribute('data-tabindex')).toBe('');
    expect(element.getAttribute('data-dropdown-page')).toBe('assignees');

    delete element.dataset.tabindex;

    expect(element.hasAttribute('data-tabindex')).toBe(false);
  });

  it('should enumerate only the data attributes', () => {
    const element = createPolyfillElement();

    element.setAttribute('data-dropdown-page', 'root');
    element.setAttribute('data-type', 'menu');
    element.setAttribute('aria-label', 'Actions');

    expect({ ...element.dataset }).toEqual({
      dropdownPage: 'root',
      type: 'menu',
    });
  });

  it('should leave out data attributes whose names have uppercase letters', () => {
    const element = createPolyfillElement();

    element.setAttribute('data-fooBar', 'camel');
    element.setAttribute('data-foo-bar', 'kebab');

    expect(Object.keys(element.dataset)).toEqual(['fooBar']);
    expect(element.dataset.fooBar).toBe('kebab');
  });

  it('should refuse a read on the prototype itself', () => {
    const polyfillWindow = new Window();
    const elementPrototype = polyfillWindow.Element.prototype as unknown as {
      dataset: DOMStringMap;
    };

    installElementDatasetPolyfill(elementPrototype);

    expect(() => elementPrototype.dataset).toThrow(TypeError);
  });

  it('should keep the inherited object behavior for names without a data attribute', () => {
    const element = createPolyfillElement();

    expect(String(element.dataset)).toBe('[object Object]');
  });

  it('should return the same dataset for the same element', () => {
    const element = createPolyfillElement();

    expect(element.dataset).toBe(element.dataset);
  });

  it('should keep a dataset accessor the prototype already defines', () => {
    const existingDataset = {};
    const elementPrototype = { dataset: existingDataset };

    installElementDatasetPolyfill(elementPrototype);

    expect(elementPrototype.dataset).toBe(existingDataset);
  });
});
