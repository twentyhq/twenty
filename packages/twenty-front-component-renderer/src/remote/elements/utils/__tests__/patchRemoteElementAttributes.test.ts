import '@/remote/generated/remote-elements';

import { patchRemoteElementAttributes } from '../patchRemoteElementAttributes';

patchRemoteElementAttributes();

type PatchedRemoteElement = {
  className?: string;
  tabIndex?: number;
  getAttribute: (attributeName: string) => string | null;
  setAttribute: (attributeName: string, attributeValue: string) => void;
  removeAttribute: (attributeName: string) => void;
};

const createHtmlDivElement = (): PatchedRemoteElement =>
  document.createElement('html-div');

describe('patchRemoteElementAttributes', () => {
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
});
