import { resolveOwnerWindowOfNode } from '@/polyfills/dom/utils/resolveOwnerWindowOfNode';
import { applySyntheticEventCompatibility } from '@/polyfills/events/utils/applySyntheticEventCompatibility';
import { resolveEventClassForEventType } from '@/polyfills/events/utils/resolveEventClassForEventType';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementDisabled } from '@/polyfills/selectors/utils/isElementDisabled';

type ClickableElement = EventTarget & SelectorElementLike & Node;

export const installElementClickMethodPolyfill = (
  elementPrototype: object,
): void => {
  Object.defineProperty(elementPrototype, 'click', {
    value: function (this: ClickableElement): void {
      if (isElementDisabled(this)) {
        return;
      }

      const clickEventClass = resolveEventClassForEventType({
        eventType: 'click',
        eventClassScope: resolveOwnerWindowOfNode(this),
      });

      this.dispatchEvent(
        applySyntheticEventCompatibility(
          new clickEventClass('click', {
            bubbles: true,
            cancelable: true,
            composed: true,
          }),
        ),
      );
    },
    configurable: true,
    writable: true,
  });
};
