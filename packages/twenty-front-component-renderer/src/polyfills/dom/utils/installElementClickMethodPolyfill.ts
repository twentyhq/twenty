import { createClickEventForElement } from '@/polyfills/dom/utils/createClickEventForElement';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';

type ClickableElement = EventTarget & SelectorElementLike & Node;

export const installElementClickMethodPolyfill = (
  elementPrototype: object,
): void => {
  const elementsWithClickInProgress = new WeakSet<ClickableElement>();

  definePolyfillMethod({
    target: elementPrototype,
    methodName: 'click',
    method: (element: ClickableElement): void => {
      if (
        isElementDisabled(element) ||
        elementsWithClickInProgress.has(element)
      ) {
        return;
      }

      elementsWithClickInProgress.add(element);

      try {
        element.dispatchEvent(createClickEventForElement(element));
      } finally {
        elementsWithClickInProgress.delete(element);
      }
    },
  });
};
