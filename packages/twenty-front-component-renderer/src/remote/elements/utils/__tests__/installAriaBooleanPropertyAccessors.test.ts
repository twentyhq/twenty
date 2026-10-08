import '@/remote/generated/remote-elements';

import { patchRemoteElementAttributes } from '@/remote/elements/utils/patchRemoteElementAttributes';

import { installAriaBooleanPropertyAccessors } from '../installAriaBooleanPropertyAccessors';

type RemoteElementWithAriaAccessors = HTMLElement &
  Record<string, unknown> & {
    updateRemoteAttribute: (attributeName: string, value?: string) => void;
  };

const createHtmlDivElement = (): RemoteElementWithAriaAccessors =>
  document.createElement('html-div') as RemoteElementWithAriaAccessors;

describe('installAriaBooleanPropertyAccessors', () => {
  beforeAll(() => {
    patchRemoteElementAttributes();
    installAriaBooleanPropertyAccessors();
  });

  it('should expose boolean aria attributes as properties', () => {
    const element = createHtmlDivElement();

    expect('aria-invalid' in element).toBe(true);
    expect('aria-expanded' in element).toBe(true);
    expect('aria-describedby' in element).toBe(false);
  });

  it('should write a true property as the true attribute value and forward it', () => {
    const element = createHtmlDivElement();
    const updateRemoteAttribute = jest.spyOn(element, 'updateRemoteAttribute');

    element['aria-invalid'] = true;

    expect(element.getAttribute('aria-invalid')).toBe('true');
    expect(element['aria-invalid']).toBe('true');
    expect(updateRemoteAttribute).toHaveBeenCalledWith('aria-invalid', 'true');
  });

  it('should write a false property as the false attribute value', () => {
    const element = createHtmlDivElement();

    element['aria-expanded'] = false;

    expect(element.getAttribute('aria-expanded')).toBe('false');
  });

  it('should keep token values such as mixed', () => {
    const element = createHtmlDivElement();

    element['aria-checked'] = 'mixed';

    expect(element.getAttribute('aria-checked')).toBe('mixed');
  });

  it('should remove the attribute for a nullish property', () => {
    const element = createHtmlDivElement();
    element['aria-selected'] = true;
    const updateRemoteAttribute = jest.spyOn(element, 'updateRemoteAttribute');

    element['aria-selected'] = null;

    expect(element.hasAttribute('aria-selected')).toBe(false);
    expect(element['aria-selected']).toBeNull();
    expect(updateRemoteAttribute).toHaveBeenCalledWith('aria-selected');
  });

  it('should remove the attribute for an empty string property', () => {
    const element = createHtmlDivElement();
    element['aria-disabled'] = true;
    const updateRemoteAttribute = jest.spyOn(element, 'updateRemoteAttribute');

    element['aria-disabled'] = '';

    expect(element.hasAttribute('aria-disabled')).toBe(false);
    expect(updateRemoteAttribute).toHaveBeenCalledWith('aria-disabled');
  });

  it('should throw when the accessor is read or written on the prototype', () => {
    const prototype = Object.getPrototypeOf(
      createHtmlDivElement(),
    ) as RemoteElementWithAriaAccessors;

    expect(() => prototype['aria-invalid']).toThrow('Illegal invocation');
    expect(() => {
      prototype['aria-invalid'] = true;
    }).toThrow('Illegal invocation');
  });

  it('should leave an explicit empty attribute value untouched', () => {
    const element = createHtmlDivElement();

    element.setAttribute('aria-invalid', '');

    expect(element.getAttribute('aria-invalid')).toBe('');
  });

  it('should leave aria attributes that remote-dom declares as properties on the property path', () => {
    const element = createHtmlDivElement();
    const updateRemoteAttribute = jest.spyOn(element, 'updateRemoteAttribute');

    element['aria-hidden'] = true;

    expect(element['aria-hidden']).toBe(true);
    expect(updateRemoteAttribute).not.toHaveBeenCalled();
  });
});
