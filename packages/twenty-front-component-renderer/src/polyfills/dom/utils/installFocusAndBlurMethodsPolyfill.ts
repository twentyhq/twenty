import { type WorkerActiveElementStore } from '@/polyfills/dom/types/WorkerActiveElementStore';
import { type WorkerFocusMethodRequest } from '@/polyfills/dom/types/WorkerFocusMethodRequest';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { isElementFocusable } from '@/polyfills/selectors/utils/isElementFocusable';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';

type InstallFocusAndBlurMethodsPolyfillInput = {
  elementPrototype: object;
  activeElementStore: WorkerActiveElementStore;
  forwardFocusMethod?: (request: WorkerFocusMethodRequest) => void;
};

export const installFocusAndBlurMethodsPolyfill = ({
  elementPrototype,
  activeElementStore,
  forwardFocusMethod,
}: InstallFocusAndBlurMethodsPolyfillInput): void => {
  definePolyfillMethod({
    target: elementPrototype,
    methodName: 'focus',
    method: (element: SelectorElementLike, options?: unknown): void => {
      if (!isElementFocusable(element)) {
        return;
      }

      activeElementStore.setActiveElement({ element });

      if (activeElementStore.getActiveElement() === element) {
        forwardFocusMethod?.({
          element,
          methodName: 'focus',
          options: options as FocusOptions | undefined,
        });
      }
    },
  });

  definePolyfillMethod({
    target: elementPrototype,
    methodName: 'blur',
    method: (element: object): void => {
      if (activeElementStore.getActiveElement() === element) {
        activeElementStore.setActiveElement({ element: null });
        forwardFocusMethod?.({ element, methodName: 'blur' });
      }
    },
  });
};
