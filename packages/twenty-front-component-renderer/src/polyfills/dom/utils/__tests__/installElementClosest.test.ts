import { Window } from '@remote-dom/polyfill';

import { installElementClosest } from '@/polyfills/dom/utils/installElementClosest';

const createDocument = () => {
  const polyfillWindow = new Window();
  installElementClosest(polyfillWindow.Element.prototype);

  return polyfillWindow.document as unknown as Document;
};

describe('installElementClosest', () => {
  it('returns the nearest matching ancestor or the element itself', () => {
    const document = createDocument();
    const outerTrigger = document.createElement('div');
    const innerTrigger = document.createElement('span');
    const content = document.createElement('button');

    outerTrigger.setAttribute('data-base-ui-tooltip-trigger', '');
    innerTrigger.setAttribute('data-base-ui-tooltip-trigger', '');
    document.body.appendChild(outerTrigger);
    outerTrigger.appendChild(innerTrigger);
    innerTrigger.appendChild(content);

    expect(content.closest('[data-base-ui-tooltip-trigger]')).toBe(
      innerTrigger,
    );
    expect(innerTrigger.closest('[data-base-ui-tooltip-trigger]')).toBe(
      innerTrigger,
    );
    expect(content.closest('[data-missing]')).toBeNull();
  });

  it('matches a detached root without moving its subtree', () => {
    const document = createDocument();
    const trigger = document.createElement('div');
    const content = document.createElement('span');

    trigger.setAttribute('data-base-ui-tooltip-trigger', '');
    trigger.appendChild(content);

    expect(content.closest('[data-base-ui-tooltip-trigger]')).toBe(trigger);
    expect(trigger.closest('[data-base-ui-tooltip-trigger]')).toBe(trigger);
    expect(trigger.parentNode).toBeNull();
    expect(content.parentNode).toBe(trigger);
  });

  it('preserves errors from the available selector implementation', () => {
    const document = createDocument();
    const element = document.createElement('span');
    document.body.appendChild(element);

    expect(() => element.closest(':unsupported')).toThrow(
      'Pseudo :unsupported not implemented',
    );
  });

  it('uses an existing matches method and preserves invalid selector errors', () => {
    class ElementWithMatches {
      matches = (selector: string) => document.body.matches(selector);
      parentElement = null;
    }

    installElementClosest(ElementWithMatches.prototype);
    const element = new ElementWithMatches() as ElementWithMatches & {
      closest: (selector: string) => ElementWithMatches | null;
    };

    expect(element.closest('body')).toBe(element);
    expect(() => element.closest('[')).toThrow();
  });

  it('preserves an existing closest implementation', () => {
    const closest = jest.fn();
    const prototype = { closest };

    installElementClosest(prototype);

    expect(prototype.closest).toBe(closest);
  });
});
