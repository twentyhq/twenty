import { updateRemoteElementProperty } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { resolveOptimisticInputSelectionState } from '@/polyfills/input-selection/utils/resolveOptimisticInputSelectionState';
import { type InputSelectionCommand } from '@/types/InputSelectionCommand';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';
import { type InputSelectionSnapshot } from '@/types/InputSelectionSnapshot';
import { type InputSelectionState } from '@/types/InputSelectionState';

export const createWorkerInputSelectionStore = () => {
  let rootElement: object | null = null;
  const states = new WeakMap<object, InputSelectionState>();
  const pendingCommands = new WeakMap<object, InputSelectionCommand[]>();
  let commandSequence = 0;
  const subscriptions = new WeakMap<
    object,
    (state: InputSelectionSnapshot) => void
  >();
  const trackedElements = new Set<object>();
  let hasScheduledDetachedElementSweep = false;

  const updatePendingCommands = ({
    element,
    commands,
  }: {
    element: object;
    commands: InputSelectionCommand[];
  }) => {
    pendingCommands.set(element, commands);
    updateRemoteElementProperty(
      element as Element,
      INPUT_SELECTION_BRIDGE_PROPERTIES.request,
      commands,
    );
  };

  const replaceSubscription = (element: object) => {
    const handleSelectionUpdate = (state: InputSelectionSnapshot) => {
      if (
        subscriptions.get(element) !== handleSelectionUpdate ||
        !isElementUnderRemoteRoot(element, rootElement)
      ) {
        return;
      }

      states.set(element, state);
      trackedElements.add(element);

      const commands = pendingCommands.get(element);

      if (!isDefined(commands)) {
        return;
      }

      const acknowledgedSequence = state.selectionCommandSequence ?? 0;
      const unacknowledgedCommands = commands.filter(
        ({ sequence }) => sequence > acknowledgedSequence,
      );

      if (unacknowledgedCommands.length === commands.length) {
        return;
      }

      updatePendingCommands({ element, commands: unacknowledgedCommands });
    };

    subscriptions.set(element, handleSelectionUpdate);
    updateRemoteElementProperty(
      element as Element,
      INPUT_SELECTION_BRIDGE_PROPERTIES.update,
      handleSelectionUpdate,
    );
  };

  const subscribe = (element: object) => {
    if (!isElementUnderRemoteRoot(element, rootElement)) {
      return;
    }

    trackedElements.add(element);

    if (subscriptions.has(element)) {
      return;
    }

    replaceSubscription(element);
  };

  const forgetDetachedElement = (element: object) => {
    trackedElements.delete(element);
    states.delete(element);

    if (pendingCommands.delete(element)) {
      updateRemoteElementProperty(
        element as Element,
        INPUT_SELECTION_BRIDGE_PROPERTIES.request,
        [],
      );
    }

    if (subscriptions.has(element)) {
      replaceSubscription(element);
    }
  };

  const sweepDetachedElements = () => {
    hasScheduledDetachedElementSweep = false;

    for (const element of trackedElements) {
      if (isElementUnderRemoteRoot(element, rootElement)) {
        continue;
      }

      forgetDetachedElement(element);
    }
  };

  return {
    setRootElement: (element: object) => {
      rootElement = element;
    },
    applySnapshot: ({
      element,
      state,
    }: {
      element: object;
      state: InputSelectionState;
    }) => {
      states.set(element, state);

      if (isElementUnderRemoteRoot(element, rootElement)) {
        trackedElements.add(element);
      }
    },
    scheduleDetachedElementSweep: () => {
      if (hasScheduledDetachedElementSweep || trackedElements.size === 0) {
        return;
      }

      hasScheduledDetachedElementSweep = true;
      queueMicrotask(sweepDetachedElements);
    },
    read: (element: object): InputSelectionState => {
      subscribe(element);

      return resolveOptimisticInputSelectionState({
        hostState: states.get(element),
        pendingCommands: pendingCommands.get(element) ?? [],
        value: (element as { value?: unknown }).value,
      });
    },
    request: ({
      element,
      request,
    }: {
      element: object;
      request: InputSelectionRequest;
    }) => {
      if (!isElementUnderRemoteRoot(element, rootElement)) {
        return;
      }
      subscribe(element);
      const commands = [
        ...(pendingCommands.get(element) ?? []),
        { sequence: ++commandSequence, request },
      ];
      updatePendingCommands({ element, commands });
    },
  };
};
