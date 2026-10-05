import { resolveOwnerWindowOfNode } from '@/polyfills/dom/utils/resolveOwnerWindowOfNode';
import { applySyntheticEventCompatibility } from '@/polyfills/events/utils/applySyntheticEventCompatibility';
import { resolveEventClassForEventType } from '@/polyfills/events/utils/resolveEventClassForEventType';
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
        const clickEventClass = resolveEventClassForEventType({
          eventType: 'click',
          eventClassScope: resolveOwnerWindowOfNode(element),
        });

        element.dispatchEvent(
          applySyntheticEventCompatibility(
            new clickEventClass('click', {
              bubbles: true,
              cancelable: true,
              composed: true,
            }),
          ),
        );
      } finally {
        elementsWithClickInProgress.delete(element);
      }
    },
  });
};
