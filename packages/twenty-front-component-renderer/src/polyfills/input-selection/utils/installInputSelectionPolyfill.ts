import { type createWorkerInputSelectionStore } from '@/polyfills/input-selection/utils/createWorkerInputSelectionStore';
import { normalizeSelectionOffset } from '@/polyfills/input-selection/utils/normalizeSelectionOffset';
import { supportsInputSelectionRange } from '@/polyfills/input-selection/utils/supportsInputSelectionRange';
import { supportsInputSelectMethod } from '@/polyfills/input-selection/utils/supportsInputSelectMethod';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { resolveInputTypeOfElement } from '@/polyfills/selectors/utils/resolveInputTypeOfElement';
import { createDomException } from '@/polyfills/utils/createDomException';
import { normalizeInputSelectionDirection } from '@/utils/normalizeInputSelectionDirection';

const SELECTION_OFFSET_PROPERTIES = ['selectionStart', 'selectionEnd'] as const;

const createUnsupportedInputSelectionError = (
  element: SelectorElementLike,
): Error =>
  createDomException(
    `The input element's type ('${resolveInputTypeOfElement(element)}') does not support selection.`,
    'InvalidStateError',
  );

export const installInputSelectionPolyfill = ({
  elementPrototypes,
  selectionStore,
}: {
  elementPrototypes: object[];
  selectionStore: ReturnType<typeof createWorkerInputSelectionStore>;
}): void => {
  for (const elementPrototype of elementPrototypes) {
    for (const property of SELECTION_OFFSET_PROPERTIES) {
      Object.defineProperty(elementPrototype, property, {
        configurable: true,
        get(this: SelectorElementLike) {
          if (!supportsInputSelectionRange(this)) {
            return null;
          }
          return selectionStore.read(this)[property];
        },
        set(this: SelectorElementLike, value: unknown) {
          if (!supportsInputSelectionRange(this)) {
            throw createUnsupportedInputSelectionError(this);
          }
          selectionStore.request({
            element: this,
            request: { property, value: normalizeSelectionOffset(value) },
          });
        },
      });
    }
    Object.defineProperty(elementPrototype, 'selectionDirection', {
      configurable: true,
      get(this: SelectorElementLike) {
        if (!supportsInputSelectionRange(this)) {
          return null;
        }
        return selectionStore.read(this).selectionDirection;
      },
      set(this: SelectorElementLike, value: unknown) {
        if (!supportsInputSelectionRange(this)) {
          throw createUnsupportedInputSelectionError(this);
        }
        selectionStore.request({
          element: this,
          request: {
            property: 'selectionDirection',
            value: normalizeInputSelectionDirection(value),
          },
        });
      },
    });
    Object.defineProperty(elementPrototype, 'select', {
      configurable: true,
      writable: true,
      value(this: SelectorElementLike) {
        if (!supportsInputSelectMethod(this)) {
          return;
        }
        selectionStore.request({
          element: this,
          request: { method: 'select' },
        });
      },
    });
    Object.defineProperty(elementPrototype, 'setSelectionRange', {
      configurable: true,
      writable: true,
      value(
        this: SelectorElementLike,
        start: unknown,
        end: unknown,
        direction?: unknown,
      ) {
        if (!supportsInputSelectionRange(this)) {
          throw createUnsupportedInputSelectionError(this);
        }
        selectionStore.request({
          element: this,
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
