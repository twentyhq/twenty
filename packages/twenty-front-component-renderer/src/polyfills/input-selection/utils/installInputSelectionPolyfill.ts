import { type createWorkerInputSelectionStore } from '@/polyfills/input-selection/utils/createWorkerInputSelectionStore';
import { type InputSelectionState } from '@/types/InputSelectionState';

const SELECTION_PROPERTIES = [
  'selectionStart',
  'selectionEnd',
  'selectionDirection',
] as const;

export const installInputSelectionPolyfill = ({
  elementPrototypes,
  selectionStore,
}: {
  elementPrototypes: object[];
  selectionStore: ReturnType<typeof createWorkerInputSelectionStore>;
}): void => {
  for (const elementPrototype of elementPrototypes) {
    for (const property of SELECTION_PROPERTIES) {
      Object.defineProperty(elementPrototype, property, {
        configurable: true,
        get(this: Element) {
          return selectionStore.read(this)[property];
        },
        set(this: Element, value: InputSelectionState[typeof property]) {
          selectionStore.request({
            element: this,
            request: { property, value },
          });
        },
      });
    }
    Object.defineProperty(elementPrototype, 'select', {
      configurable: true,
      value(this: Element) {
        selectionStore.request({
          element: this,
          request: { method: 'select' },
        });
      },
    });
    Object.defineProperty(elementPrototype, 'setSelectionRange', {
      configurable: true,
      value(this: Element, ...args: [number, number, string?]) {
        const [start, end, direction] = args;
        selectionStore.request({
          element: this,
          request: { method: 'setSelectionRange', start, end, direction },
        });
      },
    });
  }
};
