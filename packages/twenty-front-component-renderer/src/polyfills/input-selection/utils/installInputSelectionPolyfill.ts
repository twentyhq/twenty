import { type WorkerInputSelectionStore } from '@/polyfills/input-selection/types/WorkerInputSelectionStore';
import { createUnsupportedInputSelectionError } from '@/polyfills/input-selection/utils/createUnsupportedInputSelectionError';
import { defineInputSelectionPropertyAccessor } from '@/polyfills/input-selection/utils/defineInputSelectionPropertyAccessor';
import { normalizeSelectionOffset } from '@/polyfills/input-selection/utils/normalizeSelectionOffset';
import { supportsInputSelectionRange } from '@/polyfills/input-selection/utils/supportsInputSelectionRange';
import { supportsInputSelectMethod } from '@/polyfills/input-selection/utils/supportsInputSelectMethod';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';
import { normalizeInputSelectionDirection } from '@/utils/normalizeInputSelectionDirection';

const SELECTION_OFFSET_PROPERTIES = ['selectionStart', 'selectionEnd'] as const;

export const installInputSelectionPolyfill = ({
  elementPrototypes,
  selectionStore,
}: {
  elementPrototypes: object[];
  selectionStore: WorkerInputSelectionStore;
}): void => {
  for (const elementPrototype of elementPrototypes) {
    for (const property of SELECTION_OFFSET_PROPERTIES) {
      defineInputSelectionPropertyAccessor({
        elementPrototype,
        propertyName: property,
        selectionStore,
        createSelectionRequest: (value) => ({
          property,
          value: normalizeSelectionOffset(value),
        }),
      });
    }

    defineInputSelectionPropertyAccessor({
      elementPrototype,
      propertyName: 'selectionDirection',
      selectionStore,
      createSelectionRequest: (value) => ({
        property: 'selectionDirection',
        value: normalizeInputSelectionDirection(value),
      }),
    });

    definePolyfillMethod({
      target: elementPrototype,
      methodName: 'select',
      method: (element: SelectorElementLike): void => {
        if (!supportsInputSelectMethod(element)) {
          return;
        }

        selectionStore.request({ element, request: { method: 'select' } });
      },
    });

    definePolyfillMethod({
      target: elementPrototype,
      methodName: 'setSelectionRange',
      method: (
        element: SelectorElementLike,
        start: unknown,
        end: unknown,
        direction?: unknown,
      ): void => {
        if (!supportsInputSelectionRange(element)) {
          throw createUnsupportedInputSelectionError(element);
        }

        selectionStore.request({
          element,
          request: {
            method: 'setSelectionRange',
            start: normalizeSelectionOffset(start),
            end: normalizeSelectionOffset(end),
            direction: normalizeInputSelectionDirection(direction),
          },
        });
      },
    });
  }
};
