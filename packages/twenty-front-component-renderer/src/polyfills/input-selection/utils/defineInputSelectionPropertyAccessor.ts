import { type WorkerInputSelectionStore } from '@/polyfills/input-selection/types/WorkerInputSelectionStore';
import { createUnsupportedInputSelectionError } from '@/polyfills/input-selection/utils/createUnsupportedInputSelectionError';
import { supportsInputSelectionRange } from '@/polyfills/input-selection/utils/supportsInputSelectionRange';
import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';
import { type InputSelectionState } from '@/types/InputSelectionState';

export const defineInputSelectionPropertyAccessor = ({
  elementPrototype,
  propertyName,
  selectionStore,
  createSelectionRequest,
}: {
  elementPrototype: object;
  propertyName: keyof InputSelectionState;
  selectionStore: WorkerInputSelectionStore;
  createSelectionRequest: (value: unknown) => InputSelectionRequest;
}): void => {
  Object.defineProperty(elementPrototype, propertyName, {
    configurable: true,
    get(this: SelectorElementLike) {
      if (!supportsInputSelectionRange(this)) {
        return null;
      }

      return selectionStore.read(this)[propertyName];
    },
    set(this: SelectorElementLike, value: unknown) {
      if (!supportsInputSelectionRange(this)) {
        throw createUnsupportedInputSelectionError(this);
      }

      selectionStore.request({
        element: this,
        request: createSelectionRequest(value),
      });
    },
  });
};
