import '@/remote/generated/remote-elements';

import { patchRemoteElementAttributes } from '../patchRemoteElementAttributes';

const createHtmlDivElement = (): HTMLElement =>
  document.createElement('html-div');

describe('patchRemoteElementAttributes', () => {
  beforeAll(() => {
    patchRemoteElementAttributes();
  });

  describe('getAttribute on property-mapped attributes', () => {
    it('should return null when the mapped property was never set', () => {
      expect(createHtmlDivElement().getAttribute('class')).toBeNull();
    });

    it('should read the value written through the redirected setAttribute', () => {
      const element = createHtmlDivElement();

      element.setAttribute('class', 'first second');

      expect(element.getAttribute('class')).toBe('first second');
    });

    it('should read a value assigned directly to the mapped property', () => {
      const element = createHtmlDivElement();

      element.className = 'from-react';

      expect(element.getAttribute('class')).toBe('from-react');
    });

    it('should stringify a non-string mapped property value', () => {
      const element = createHtmlDivElement();

      element.tabIndex = 3;

      expect(element.getAttribute('tabindex')).toBe('3');
    });

    it('should read a falsy mapped property value', () => {
      const element = createHtmlDivElement();

      element.tabIndex = 0;

      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('should read an explicitly emptied mapped property as an empty value', () => {
      const element = createHtmlDivElement();

      element.setAttribute('class', '');

      expect(element.getAttribute('class')).toBe('');
    });

    it('should return null again after removeAttribute', () => {
      const element = createHtmlDivElement();

      element.setAttribute('class', 'present');
      element.removeAttribute('class');

      expect(element.getAttribute('class')).toBeNull();
    });

    it('should keep the original getAttribute for unmapped attributes', () => {
      const element = createHtmlDivElement();

      element.setAttribute('id', 'anchor');

      expect(element.getAttribute('id')).toBe('anchor');
    });
  });

  describe('hasAttribute on property-mapped attributes', () => {
    it('should return false when the mapped property was never set', () => {
      expect(createHtmlDivElement().hasAttribute('class')).toBe(false);
    });

    it('should return true once the mapped property holds a value', () => {
      const element = createHtmlDivElement();

      element.setAttribute('class', 'present');

      expect(element.hasAttribute('class')).toBe(true);
    });

    it('should return true for a falsy mapped property value', () => {
      const element = createHtmlDivElement();

      element.tabIndex = 0;

      expect(element.hasAttribute('tabindex')).toBe(true);
    });

    it('should return false again after removeAttribute', () => {
      const element = createHtmlDivElement();

      element.setAttribute('class', 'present');
      element.removeAttribute('class');

      expect(element.hasAttribute('class')).toBe(false);
    });

    it('should keep the original hasAttribute for unmapped attributes', () => {
      const element = createHtmlDivElement();

      element.setAttribute('id', 'anchor');

      expect(element.hasAttribute('id')).toBe(true);
      expect(element.hasAttribute('title')).toBe(false);
    });
  });

  describe('getAttributeNames on property-mapped attributes', () => {
    it('should not list a mapped attribute whose property was never set', () => {
      expect(createHtmlDivElement().getAttributeNames()).not.toContain('class');
    });

    it('should list the canonical name, not the property alias', () => {
      const element = createHtmlDivElement();

      element.className = 'from-react';

      expect(element.getAttributeNames()).toEqual(['class']);
    });

    it('should list a mapped attribute holding a falsy value', () => {
      const element = createHtmlDivElement();

      element.tabIndex = 0;

      expect(element.getAttributeNames()).toEqual(['tabindex']);
    });

    it('should list mapped attributes alongside real ones', () => {
      const element = createHtmlDivElement();

      element.setAttribute('id', 'anchor');
      element.setAttribute('class', 'present');

      expect(element.getAttributeNames()).toEqual(['id', 'class']);
    });

    it('should stop listing a mapped attribute after removeAttribute', () => {
      const element = createHtmlDivElement();

      element.setAttribute('id', 'anchor');
      element.setAttribute('class', 'present');
      element.removeAttribute('class');

      expect(element.getAttributeNames()).toEqual(['id']);
    });
  });

  describe('attribute names colliding with Object prototype keys', () => {
    it('should store them as real attributes instead of mapping them to a property', () => {
      const element = createHtmlDivElement();

      element.setAttribute('constructor', 'plain-attribute-value');

      expect(element.getAttribute('constructor')).toBe('plain-attribute-value');
      expect(element.hasAttribute('constructor')).toBe(true);
      expect(element.getAttributeNames()).toContain('constructor');
    });

    it('should return null for an unset attribute named after an Object prototype key', () => {
      expect(createHtmlDivElement().getAttribute('toString')).toBeNull();
    });
  });
});
