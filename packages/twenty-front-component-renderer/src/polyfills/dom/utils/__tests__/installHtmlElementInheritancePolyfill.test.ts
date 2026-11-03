import {
  HTMLElement as PolyfillHtmlElement,
  Window,
} from '@remote-dom/polyfill';

import { installHtmlElementInheritancePolyfill } from '../installHtmlElementInheritancePolyfill';

describe('installHtmlElementInheritancePolyfill', () => {
  it('should preserve document elements and inherit HTML element behavior in existing and new documents', () => {
    const polyfillWindow = new Window();
    const documentTarget = polyfillWindow.document;
    const elements = [
      documentTarget.body,
      documentTarget.head,
      documentTarget.documentElement,
    ];
    const originalPrototypeParents = elements.map((element) => ({
      prototype: Object.getPrototypeOf(element),
      parent: Object.getPrototypeOf(Object.getPrototypeOf(element)),
    }));

    try {
      installHtmlElementInheritancePolyfill({
        documentTarget,
        htmlElementPrototype: PolyfillHtmlElement.prototype,
      });
      installHtmlElementInheritancePolyfill({
        documentTarget,
        htmlElementPrototype: PolyfillHtmlElement.prototype,
      });

      expect(polyfillWindow.document).toBe(documentTarget);
      expect(documentTarget.body).toBe(elements[0]);
      expect(documentTarget.head).toBe(elements[1]);
      expect(documentTarget.documentElement).toBe(elements[2]);

      const nextDocument = new Window().document;

      for (const element of [
        ...elements,
        nextDocument.body,
        nextDocument.head,
        nextDocument.documentElement,
      ]) {
        expect(element).toBeInstanceOf(PolyfillHtmlElement);
        expect(element).toBeInstanceOf(polyfillWindow.Element);
      }
    } finally {
      for (const { prototype, parent } of originalPrototypeParents) {
        Object.setPrototypeOf(prototype, parent);
      }
    }
  });

  it('should preserve existing HTML element inheritance', () => {
    const bodyPrototype = Object.getPrototypeOf(document.body);
    const originalParent = Object.getPrototypeOf(bodyPrototype);

    installHtmlElementInheritancePolyfill({
      documentTarget: document,
      htmlElementPrototype: HTMLElement.prototype,
    });

    expect(Object.getPrototypeOf(bodyPrototype)).toBe(originalParent);
    expect(document.body).toBeInstanceOf(HTMLElement);
    expect(document.head).toBeInstanceOf(HTMLElement);
    expect(document.documentElement).toBeInstanceOf(HTMLElement);
  });
});
