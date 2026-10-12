import { isDefined } from 'twenty-shared/utils';

import { type EventScrollExtent } from '@/polyfills/scroll/types/EventScrollExtent';
import { type WorkerScrollStore } from '@/polyfills/scroll/types/WorkerScrollStore';
import { createScrollPositionRequest } from '@/polyfills/scroll/utils/createScrollPositionRequest';
import { normalizeScrollIntoViewArguments } from '@/polyfills/scroll/utils/normalizeScrollIntoViewArguments';
import { normalizeScrollOffset } from '@/polyfills/scroll/utils/normalizeScrollOffset';
import { normalizeScrollToArguments } from '@/polyfills/scroll/utils/normalizeScrollToArguments';
import { readPrototypeNumberGetter } from '@/polyfills/scroll/utils/readPrototypeNumberGetter';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';
import { type ScrollAxis } from '@/types/ScrollAxis';

const SCROLL_OFFSET_PROPERTIES: { propertyName: string; axis: ScrollAxis }[] = [
  { propertyName: 'scrollTop', axis: 'top' },
  { propertyName: 'scrollLeft', axis: 'left' },
];

const EVENT_SCROLL_EXTENTS: EventScrollExtent[] = [
  'scrollWidth',
  'clientWidth',
];

const SCROLL_TO_METHOD_NAMES = ['scrollTo', 'scroll'];

export const installElementScrollPolyfill = ({
  elementPrototype,
  scrollStore,
}: {
  elementPrototype: object;
  scrollStore: WorkerScrollStore;
}): void => {
  for (const { propertyName, axis } of SCROLL_OFFSET_PROPERTIES) {
    const readBaseScrollOffset = readPrototypeNumberGetter({
      prototype: elementPrototype,
      propertyName,
    });

    Object.defineProperty(elementPrototype, propertyName, {
      get(this: object) {
        if (!scrollStore.isScrollCommandTarget(this)) {
          return readBaseScrollOffset(this);
        }

        return scrollStore.readScrollOffset({ element: this, axis });
      },
      set(this: object, value: unknown) {
        scrollStore.requestScroll({
          element: this,
          request: createScrollPositionRequest({
            axis,
            offset: normalizeScrollOffset(value),
          }),
        });
      },
      configurable: true,
    });
  }

  for (const extent of EVENT_SCROLL_EXTENTS) {
    const readBaseExtent = readPrototypeNumberGetter({
      prototype: elementPrototype,
      propertyName: extent,
    });

    Object.defineProperty(elementPrototype, extent, {
      get(this: object) {
        const eventScrollExtent = scrollStore.readEventScrollExtent({
          element: this,
          extent,
        });

        return isDefined(eventScrollExtent)
          ? eventScrollExtent
          : readBaseExtent(this);
      },
      configurable: true,
    });
  }

  for (const methodName of SCROLL_TO_METHOD_NAMES) {
    definePolyfillMethod<object>({
      target: elementPrototype,
      methodName,
      method: (element, ...scrollToArguments) => {
        const scrollAxisOffsets = normalizeScrollToArguments(scrollToArguments);

        if (
          !isDefined(scrollAxisOffsets.top) &&
          !isDefined(scrollAxisOffsets.left)
        ) {
          return;
        }

        scrollStore.requestScroll({
          element,
          request: { method: 'scrollTo', ...scrollAxisOffsets },
        });
      },
    });
  }

  definePolyfillMethod<object>({
    target: elementPrototype,
    methodName: 'scrollIntoView',
    method: (element, scrollIntoViewArgument) => {
      scrollStore.requestScroll({
        element,
        request: {
          method: 'scrollIntoView',
          ...normalizeScrollIntoViewArguments(scrollIntoViewArgument),
        },
      });
    },
  });
};
