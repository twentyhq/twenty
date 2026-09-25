import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementFocusable } from '@/polyfills/selectors/utils/isElementFocusable';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';

type InstallFocusAndBlurMethodsPolyfillInput = {
  elementPrototype: object;
  activeElementStore: WorkerActiveElementStore;
};

export const installFocusAndBlurMethodsPolyfill = ({
  elementPrototype,
  activeElementStore,
}: InstallFocusAndBlurMethodsPolyfillInput): void => {
  definePolyfillMethod({
    target: elementPrototype,
    methodName: 'focus',
    method: (element: SelectorElementLike): void => {
      if (!isElementFocusable(element)) {
        return;
      }

      activeElementStore.setActiveElement(element);
    },
  });

  definePolyfillMethod({
    target: elementPrototype,
    methodName: 'blur',
    method: (element: object): void => {
      if (activeElementStore.getActiveElement() === element) {
        activeElementStore.setActiveElement(null);
      }
    },
  });
};
