import { createWorkerInputSelectionStore } from '../createWorkerInputSelectionStore';
import { installInputSelectionPolyfill } from '../installInputSelectionPolyfill';

describe('installInputSelectionPolyfill', () => {
  it.each(['select', 'setSelectionRange'])(
    'should let an element override %s like a native method',
    (methodName) => {
      const elementPrototype = {};

      installInputSelectionPolyfill({
        elementPrototypes: [elementPrototype],
        selectionStore: createWorkerInputSelectionStore(),
      });

      const element: Record<string, unknown> = Object.create(elementPrototype);
      const overridingMethod = jest.fn();

      element[methodName] = overridingMethod;

      expect(element[methodName]).toBe(overridingMethod);
    },
  );
});
